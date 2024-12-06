declare module 'string-mask' {
  interface StringMaskOptions {
    reverse?: boolean
  }

  interface StringMask {
    apply(
      value: string | number,
      pattern: string,
      options?: StringMaskOptions
    ): string
    process(
      value: string | number,
      pattern: string,
      options?: StringMaskOptions
    ): {
      result: string
      valid: boolean
    }
    validate(
      value: string,
      pattern: string,
      options?: StringMaskOptions
    ): boolean
  }

  const mask: StringMask &
    ((pattern: string, options?: StringMaskOptions) => StringMask)
  export default mask
}
