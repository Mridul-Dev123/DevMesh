/**
 * Avatar component — shows user photo or a coloured circle with initials as fallback
 * Props:
 *   user: { avatarUrl?: string, username: string }
 *   size: number (px, default 40)
 *   className: string
 */
const Avatar = ({ user, size = 40, className = "" }) => {
    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : "?";

    if (user?.avatarUrl) {
        return (
            <img
                src={user.avatarUrl}
                alt={user.username}
                className={`rounded-full object-cover ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    // Derive a consistent hue from the username string
    const hue = user?.username
        ? user.username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
        : 200;

    return (
        <div
            className={`rounded-full flex items-center justify-center font-semibold text-white select-none ${className}`}
            style={{
                width: size,
                height: size,
                background: `hsl(${hue}, 65%, 50%)`,
                fontSize: size * 0.38,
            }}
            aria-label={user?.username ?? "User"}
        >
            {initials}
        </div>
    );
};

export default Avatar;
