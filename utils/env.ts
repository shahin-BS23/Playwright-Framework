export default class ENV {
    public static ENVIRONMENT_NAME = process.env.ENVIRONMENT_NAME
    public static BASE_URL = process.env.BASE_URL?.replace(/\/$/, "");

    public static BUSINESS_ADMIN_EMAIL = process.env.BUSINESS_ADMIN_EMAIL
    public static BUSINESS_ADMIN_PASSWORD = process.env.BUSINESS_ADMIN_PASSWORD
    public static BUSINESS_NAME = process.env.BUSINESS_NAME

    public static SITE_ACCESS_USER_NAME = process.env.SITE_ACCESS_USER_NAME
    public static SITE_ACCESS_PASSWORD = process.env.SITE_ACCESS_PASSWORD
}
