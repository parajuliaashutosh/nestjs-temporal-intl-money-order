import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsEnumExcluding<T extends object>(
  entity: T,
  excludedValues: T[keyof T][],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEnumExcluding',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // Constrain T to object, then Object.values is OK
          const values = Object.values(entity).filter(
            (v) => !excludedValues.includes(v as T[keyof T])
          );
          return values.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid enum value excluding ${excludedValues.join(', ')}`;
        },
      },
    });
  };
}
