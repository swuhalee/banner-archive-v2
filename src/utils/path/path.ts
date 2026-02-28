const ALLOWED_RETURN_PATHS = ["/", "/archive", "/stats"] as const;
type AllowedPath = typeof ALLOWED_RETURN_PATHS[number];

function normalizePath(input: string): string | null {
    const trimmed = input.trim();

    // 프로토콜이나 도메인 형태 감지 (http://, https://, //domain.com)
    if (/^(?:[a-z]+:)?\/\//i.test(trimmed)) return null;

    // 루트 경로 시작 확인
    if (!trimmed.startsWith("/")) return null;

    // 쿼리 스트링 및 해시 제거
    const [pathOnly] = trimmed.split(/[?#]/, 1);

    // 경로 정규화 (마지막 슬래시 제거)
    const normalized = pathOnly !== "/" && pathOnly.endsWith("/")
        ? pathOnly.slice(0, -1)
        : pathOnly;

    return normalized;
}

export function sanitizeReturnPath(input: string | null | undefined, fallback: AllowedPath = "/"): AllowedPath {
    if (!input) return fallback;

    const normalized = normalizePath(input);

    return (ALLOWED_RETURN_PATHS as readonly string[]).includes(normalized ?? "")
        ? (normalized as AllowedPath)
        : fallback;
}
