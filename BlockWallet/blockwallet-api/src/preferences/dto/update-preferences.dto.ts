import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsIn(['market_cap_desc', 'market_cap_asc', 'volume_desc', 'volume_asc', 'price_change_desc', 'id_asc'])
  marketSortOrder?: string;

  @IsOptional()
  @IsIn(['1', '7', '30', '90', '365', 'max'])
  chartPeriodDefault?: string;

  @IsOptional()
  @IsIn(['usd', 'brl'])
  currencyDisplay?: string;

  @IsOptional()
  @IsIn(['dark', 'light'])
  theme?: string;

  @IsOptional()
  @IsBoolean()
  showPortfolioValue?: boolean;

  @IsOptional()
  @IsIn(['1h', '24h', '7d'])
  priceChangeTimeframe?: string;

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}
