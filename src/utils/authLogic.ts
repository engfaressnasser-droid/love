export type UserRole = 'guest' | 'love' | 'admin';

export interface AuthResult {
  success: boolean;
  role: UserRole;
  displayName: string;
  welcomeMessage?: string;
  errorMessage?: string;
}

/**
 * Validates the entered password/passcode secretly.
 * - Girlfriend: "14/2" (supports English & Arabic-Indic digits, trims whitespace)
 * - Ahmed (Admin/Editor): "احمد" or "أحمد" or "ahmed" or "Ahmed"
 */
export function authenticateUser(passcode: string): AuthResult {
  const normalized = (passcode || '').trim().toLowerCase();

  // Normalize Eastern Arabic numerals (٠-٩) to Western digits (0-9) and remove spaces around '/'
  const normalizedDigits = normalized
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\s*\/\s*/g, '/');

  // Remove common Arabic diacritics / normalize alef
  const normalizedArabic = normalized
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه');

  if (normalizedDigits === '14/2') {
    return {
      success: true,
      role: 'love',
      displayName: 'حبيبتي ودنيتي',
      welcomeMessage: 'نورتي عالمنا الخاص يا أجمل ما في حياتي ❤️ هذا المكان صُنع بحب لكِ وحدكِ.',
    };
  }

  if (
    normalizedArabic === 'احمد' ||
    normalized === 'ahmed'
  ) {
    return {
      success: true,
      role: 'admin',
      displayName: 'أحمد',
      welcomeMessage: 'أهلاً بك يا أحمد 👑 تم تفعيل وضع التعديل وإدارة الموقع بالكامل.',
    };
  }

  return {
    success: false,
    role: 'guest',
    displayName: '',
    errorMessage: 'كلمة السر غير صحيحة، يرجى التأكد من كتابتها بشكل صحيح ❤️',
  };
}

/**
 * Determines whether the user has permission to edit the site.
 */
export function canEditSite(role: UserRole): boolean {
  return role === 'admin';
}
