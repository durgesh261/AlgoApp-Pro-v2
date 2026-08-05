import { PortfolioAggregationService } from './PortfolioAggregationService.js';
import { createPortfolioRouter } from './portfolio.routes.js';

export const portfolioAggregationService = new PortfolioAggregationService();
export const portfolioRouter = createPortfolioRouter(portfolioAggregationService);
