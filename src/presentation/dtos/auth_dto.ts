import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterBodyDTO {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginBodyDTO {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
