import QRCode from "qrcode";

/** Size (px) of the QR code rendered on compass images */
export const QR_SIZE = 64;

/**
 * Generate a QR-code as a data-URL PNG encoding the user's profile link.
 * The resulting image is small (QR_SIZE × QR_SIZE) and transparent-friendly.
 */
export async function generateProfileQR(
  userId: string,
  opts?: { dark?: string; light?: string }
): Promise<string> {
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${userId}`;
  return QRCode.toDataURL(profileUrl, {
    width: QR_SIZE * 4, // render at 4× for crisp display
    margin: 1,
    color: {
      dark: opts?.dark ?? "#1E3A6BCC",
      light: opts?.light ?? "#00000000", // transparent background
    },
    errorCorrectionLevel: "M",
  });
}
