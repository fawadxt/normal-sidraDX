import { BiometricAuth } from '@aparajita/capacitor-biometric-auth'
import { BRAND } from '../config/brand'

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const result = await BiometricAuth.checkBiometry()
    return result.isAvailable
  } catch {
    return false
  }
}

export async function promptBiometricUnlock(reason = `Unlock ${BRAND.name}`): Promise<boolean> {
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'Use passcode',
      allowDeviceCredential: false,
    })
    return true
  } catch {
    return false
  }
}
