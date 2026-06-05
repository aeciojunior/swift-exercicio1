import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSnapshotDto {
  @IsNumber()
  @Min(0)
  totalValueUsd: number;

  @IsNumber()
  @Min(0)
  availableBalanceUsd: number;

  @IsNumber()
  @Min(0)
  assetCount: number;

  @IsOptional()
  @IsDateString()
  snapshotDate?: string;
}
