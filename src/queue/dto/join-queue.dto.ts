import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @IsNumber()
  barberId: number;

  @IsNumber()
  serviceId: number;
}
