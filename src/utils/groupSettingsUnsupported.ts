/** Resposta quando a Evolution GO não expõe POST /group/settings (issue #42). */
export const GO_GROUP_SETTINGS_SKIPPED = {
  skipped: true,
  code: 'GO_GROUP_SETTINGS_UNSUPPORTED',
} as const;

export function isGroupSettingsUnsupportedError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: string }).code === GO_GROUP_SETTINGS_SKIPPED.code
  );
}

export function isGroupSettingsSkippedPayload(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { skipped?: boolean; code?: string }).skipped === true &&
    (data as { code?: string }).code === GO_GROUP_SETTINGS_SKIPPED.code
  );
}
