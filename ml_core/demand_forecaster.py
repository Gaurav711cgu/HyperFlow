import numpy as np
from scipy.stats import norm
from scipy.optimize import minimize
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import HistGradientBoostingRegressor

class TobitRegressor:
    """
    Type I Right-Censored Heteroscedastic Tobit Regression Model.
    Estimates the latent demand distribution where the variance is modeled dynamically
    as log(sigma_i) = Z_i * gamma to resolve heteroscedasticity bias.
    """
    def __init__(self):
        self.beta = None
        self.gamma = None
        self.fitted = False

    def _neg_log_likelihood(self, params, X, y, censored):
        """
        Calculates the negative log-likelihood of the Heteroscedastic Tobit Model.
        params: contains [beta_0, beta_1, ..., beta_k, gamma_0, gamma_1, ..., gamma_k]
        """
        n_features = X.shape[1]
        beta = params[:n_features]
        gamma = params[n_features:]

        # Linear prediction of latent variable mean (mu_i) and scale (sigma_i)
        mu = np.dot(X, beta)
        # Using exponential link function to guarantee positive standard deviations
        sigma = np.exp(np.dot(X, gamma))
        # Clip to prevent numerical overflow/underflow
        sigma = np.clip(sigma, 1e-4, 1e4)

        # Uncensored observations (observed sales < stockout limit)
        uncens = ~censored
        y_uncens = y[uncens]
        mu_uncens = mu[uncens]
        sigma_uncens = sigma[uncens]

        # Log-likelihood for uncensored data (normal distribution pdf with dynamic sigma_i)
        ll_uncens = -0.5 * np.sum(np.log(2 * np.pi * sigma_uncens**2)) - \
                    np.sum(((y_uncens - mu_uncens) / sigma_uncens)**2) / 2.0

        # Censored observations (observed sales >= stockout limit)
        cens = censored
        y_cens = y[cens]
        mu_cens = mu[cens]
        sigma_cens = sigma[cens]

        # Probability of being censored: P(Y* >= y) = 1 - Phi((y - mu) / sigma) = Phi((mu - y) / sigma)
        # Numerical stability via log survival function (logsf)
        z = (y_cens - mu_cens) / sigma_cens
        ll_cens = np.sum(norm.logsf(z))

        return -(ll_uncens + ll_cens)

    def fit(self, X, y, censored):
        """
        Fit the Heteroscedastic Tobit model parameters.
        """
        # Add intercept column to X
        X_const = np.column_stack([np.ones(X.shape[0]), X])
        n_features = X_const.shape[1]

        # Initialize beta via OLS
        ols = LinearRegression(fit_intercept=False).fit(X_const, y)
        init_beta = ols.coef_
        
        # Initialize gamma (log standard error coefficients)
        residuals = y - ols.predict(X_const)
        init_sigma = np.std(residuals) if np.std(residuals) > 0 else 1.0
        
        # Standard OLS intercept initialization for log(sigma)
        init_gamma = np.zeros(n_features)
        init_gamma[0] = np.log(init_sigma)

        init_params = np.append(init_beta, init_gamma)

        # Optimize MLE log-likelihood
        res = minimize(
            self._neg_log_likelihood,
            init_params,
            args=(X_const, y, censored),
            method='L-BFGS-B'
        )

        if not res.success:
            # Fallback to homoscedastic OLS structure if convergence fails
            self.beta = init_beta
            self.gamma = init_gamma
        else:
            self.beta = res.x[:n_features]
            self.gamma = res.x[n_features:]

        self.fitted = True
        return self

    def predict_latent(self, X):
        """
        Predict expected latent value E[Y* | X]
        """
        if not self.fitted:
            raise ValueError("Model not fitted yet.")
        X_const = np.column_stack([np.ones(X.shape[0]), X])
        return np.dot(X_const, self.beta)

    def get_dynamic_sigma(self, X):
        """
        Predict standard error sigma_i for each observation dynamically.
        """
        if not self.fitted:
            raise ValueError("Model not fitted yet.")
        X_const = np.column_stack([np.ones(X.shape[0]), X])
        sigma = np.exp(np.dot(X_const, self.gamma))
        return np.clip(sigma, 1e-4, 1e4)

    def impute_demand(self, X, y_obs, censored):
        """
        Imputes latent demand for censored days using heteroscedastic Inverse Mills Ratio:
        E[Y* | Y* >= y_obs, X] = X*beta + sigma_i * lambda(z_i)
        """
        if not self.fitted:
            raise ValueError("Model not fitted yet.")
        
        y_pred_latent = self.predict_latent(X)
        sigmas = self.get_dynamic_sigma(X)
        
        y_imputed = np.copy(y_obs).astype(float)
        
        if np.any(censored):
            # Compute individual z_i using dynamic sigma_i
            z = (y_obs[censored] - y_pred_latent[censored]) / sigmas[censored]
            z_clipped = np.clip(z, -5.0, 5.0)
            
            # Inverse Mills Ratio
            imr = norm.pdf(z_clipped) / (norm.sf(z_clipped) + 1e-9)
            
            y_imputed[censored] = y_pred_latent[censored] + sigmas[censored] * imr
            y_imputed[censored] = np.maximum(y_imputed[censored], y_obs[censored])
            
        return y_imputed


class CensoredDemandForecaster:
    """
    Two-Stage Heteroscedastic Demand Forecaster.
    """
    def __init__(self):
        self.tobit = TobitRegressor()
        self.forecaster = HistGradientBoostingRegressor(loss='absolute_error')
        self.fitted = False

    def fit(self, X, y_obs, censored):
        self.tobit.fit(X, y_obs, censored)
        y_imputed = self.tobit.impute_demand(X, y_obs, censored)
        self.forecaster.fit(X, y_imputed)
        self.fitted = True
        return self

    def predict(self, X):
        if not self.fitted:
            raise ValueError("Model not fitted yet.")
        return self.forecaster.predict(X)

    def predict_with_intervals(self, X, confidence_level=0.90):
        """
        Uses the estimated heteroscedastic standard deviation (sigma_i) to return
        dynamic confidence intervals tailored to each day's variance.
        """
        point_forecast = self.predict(X)
        sigmas = self.tobit.get_dynamic_sigma(X)
        
        alpha = 1 - confidence_level
        z_score = norm.ppf(1 - alpha / 2)
        
        # Dynamic margin per observation
        margin = z_score * sigmas
        
        lower_bound = np.maximum(0, point_forecast - margin)
        upper_bound = point_forecast + margin
        
        return point_forecast, lower_bound, upper_bound
