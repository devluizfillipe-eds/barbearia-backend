import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  avgDuration: number;
}
