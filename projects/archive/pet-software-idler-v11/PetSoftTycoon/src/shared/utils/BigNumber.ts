/**
 * Custom BigNumber implementation optimized for idle game values
 * Handles values from 0 to 10^308 with scientific notation display
 */
export class BigNumber {
  private value: number = 0;
  private exponent: number = 0;
  
  constructor(value: number = 0, exponent: number = 0) {
    this.normalize(value, exponent);
  }
  
  private normalize(value: number, exponent: number): void {
    if (value === 0) {
      this.value = 0;
      this.exponent = 0;
      return;
    }
    
    // Normalize to keep value between 1 and 1000
    while (value >= 1000 && exponent < 308) {
      value /= 1000;
      exponent += 3;
    }
    
    while (value < 1 && value > 0 && exponent > 0) {
      value *= 1000;
      exponent -= 3;
    }
    
    this.value = value;
    this.exponent = exponent;
  }
  
  add(other: BigNumber): BigNumber {
    if (this.exponent === other.exponent) {
      return new BigNumber(this.value + other.value, this.exponent);
    }
    
    // Convert to same exponent for addition
    const [larger, smaller] = this.exponent > other.exponent ? 
      [this, other] : [other, this];
    
    const exponentDiff = larger.exponent - smaller.exponent;
    const adjustedSmaller = smaller.value / Math.pow(1000, exponentDiff / 3);
    
    return new BigNumber(larger.value + adjustedSmaller, larger.exponent);
  }
  
  multiply(multiplier: number): BigNumber {
    return new BigNumber(this.value * multiplier, this.exponent);
  }
  
  greaterThan(other: BigNumber): boolean {
    if (this.exponent > other.exponent) return true;
    if (this.exponent < other.exponent) return false;
    return this.value > other.value;
  }
  
  toString(): string {
    if (this.exponent === 0) {
      return this.value.toFixed(2);
    }
    
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];
    const suffixIndex = this.exponent / 3;
    
    if (suffixIndex < suffixes.length) {
      return `${this.value.toFixed(2)}${suffixes[suffixIndex]}`;
    }
    
    return `${this.value.toFixed(2)}e${this.exponent}`;
  }
  
  // Serialization for save system
  serialize(): { value: number; exponent: number } {
    return { value: this.value, exponent: this.exponent };
  }
  
  static deserialize(data: { value: number; exponent: number }): BigNumber {
    return new BigNumber(data.value, data.exponent);
  }
}