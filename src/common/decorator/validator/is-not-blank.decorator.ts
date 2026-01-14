import {
    registerDecorator,
    type ValidationArguments,
    type ValidationOptions,
} from 'class-validator';

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} cannot be just spaces`, // Default message
        ...validationOptions, // Allow overriding
      },
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value?.trim()?.length > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} cannot be just spaces`;
        },
      },
    });
  };
}
