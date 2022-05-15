import { IsString, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
    @MaxLength(50)
    @MinLength(5)
    @IsString()
    login: string;

    @MaxLength(50)
    @MinLength(5)
    @IsString()
    password: string;
}
