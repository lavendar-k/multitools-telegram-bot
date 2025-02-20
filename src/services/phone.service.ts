import { parsePhoneNumberWithError, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { countryNames } from '../types/const';

interface PhoneInfo {
  country: string;
  countryCode: string;
  isValid: boolean;
  nationalFormat: string;
  internationalFormat: string;
  type?: string;
}

export class PhoneService {
  public isValidPhoneNumber(phoneNumber: string): boolean {
    try {
      // Remove common separators and spaces
      const cleanNumber = this.cleanPhoneNumber(phoneNumber);

      // Try parsing with different country codes if no prefix is provided
      if (!cleanNumber.startsWith('+')) {
        const commonPrefixes = ['1', '44', '81', '86']; // Add more common prefixes
        for (const prefix of commonPrefixes) {
          if (isValidPhoneNumber(`+${prefix}${cleanNumber}`)) {
            return true;
          }
        }
      }

      return isValidPhoneNumber(cleanNumber);
    } catch (error) {
      console.error('Error validating phone number:', error);
      return false;
    }
  }

  public getPhoneInfo(phoneNumber: string): PhoneInfo {
    try {
      const cleanNumber = this.cleanPhoneNumber(phoneNumber);
      let parsedNumber;

      // Handle numbers without country code
      if (!cleanNumber.startsWith('+')) {
        parsedNumber = this.detectCountryAndParse(cleanNumber);
      } else {
        parsedNumber = parsePhoneNumberWithError(cleanNumber);
      }

      if (!parsedNumber) {
        throw new Error('Could not parse phone number');
      }

      const country = parsedNumber.country as string;
      const countryName = countryNames[country] || country;

      return {
        country: countryName,
        countryCode: `+${parsedNumber.countryCallingCode}`,
        isValid: parsedNumber.isValid(),
        nationalFormat: parsedNumber.formatNational(),
        internationalFormat: parsedNumber.formatInternational(),
        type: this.getNumberType(parsedNumber),
      };
    } catch (error) {
      console.error('Error getting phone info:', error);
      throw error;
    }
  }

  private cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters except + at the start
    let cleaned = phoneNumber.trim();

    // Handle common formatting variations
    cleaned = cleaned.replace(/^00/g, '+'); // Convert 00 to +
    cleaned = cleaned.replace(/^0(?=[1-9])/g, '+'); // Convert leading 0 to +

    // Remove spaces, dashes, parentheses, and dots
    cleaned = cleaned.replace(/[\s\-\(\)\.]/g, '');

    return cleaned;
  }

  private detectCountryAndParse(phoneNumber: string) {
    // Common country codes to try (expand this list based on your needs)
    const commonCountries: CountryCode[] = [
      'US',
      'GB',
      'CA',
      'AU',
      'IN',
      'DE',
      'FR',
      'IT',
      'ES',
      'BR',
    ];

    for (const country of commonCountries) {
      try {
        const parsedNumber = parsePhoneNumberWithError(phoneNumber, country);
        if (parsedNumber.isValid()) {
          return parsedNumber;
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  private getNumberType(parsedNumber: any): string {
    const types: { [key: string]: string } = {
      MOBILE: 'Mobile',
      FIXED_LINE: 'Landline',
      FIXED_LINE_OR_MOBILE: 'Landline or Mobile',
      TOLL_FREE: 'Toll Free',
      PREMIUM_RATE: 'Premium Rate',
      SHARED_COST: 'Shared Cost',
      VOIP: 'VoIP',
      PERSONAL_NUMBER: 'Personal Number',
      PAGER: 'Pager',
      UAN: 'Universal Access Number',
      UNKNOWN: 'Unknown',
    };

    return types[parsedNumber.getType()] || 'Unknown';
  }
}
