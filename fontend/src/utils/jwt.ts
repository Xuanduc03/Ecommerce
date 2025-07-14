export const decodeJwtToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    return {
      email: decoded.email,
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"], // ✅ Lấy đúng role
      name: decoded.name,
      userId: decoded.sub
    };
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
};
