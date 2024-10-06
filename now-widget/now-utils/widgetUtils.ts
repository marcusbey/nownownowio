import { Post, User } from "@/lib/types";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import React from "react";
import { Root, createRoot } from "react-dom/client";

const NowPanelContent = React.lazy(() => import("../now-components/NowPanelContent"));

const SECRET_KEY = process.env.WIDGET_SECRET_KEY!;

if (!SECRET_KEY) {
    throw new Error('WIDGET_SECRET_KEY is not defined');
}

interface InitializeWidgetParams {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    theme: "light" | "dark";
    position: "left" | "right";
    buttonColor: string;
    buttonSize: number;
    posts: Post[];
    user: User | null;
    isLoading: boolean;
    error: string | null;
    userId: string;
    token: string;
}

interface CleanupWidgetParams {
    nowButtonRootRef: React.RefObject<Root | null>;
    nowPanelRootRef: React.RefObject<Root | null>;
}

interface ApiKeyOptions {
    userId: string;
    expiresIn?: number;
}

export const initializeWidget = ({
    setIsOpen,
    theme,
    position,
    buttonColor,
    buttonSize,
    posts,
    user,
    isLoading,
    error,
    userId,
    token,
}: InitializeWidgetParams): { nowButtonRoot: Root; nowPanelRoot: Root | null } => {
    // Inject custom styles if needed
    const style = document.createElement("style");
    style.innerHTML = `
    /* Additional dynamic styles can be added here */
    `;
    document.head.appendChild(style);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "now__overlay";
    document.body.insertBefore(overlay, document.body.firstChild);

    // Create side panel
    const sideNav = document.createElement("div");
    sideNav.id = "now__nowpanel";
    sideNav.innerHTML = `
        <span class="closebtn">&times;</span>
        <div id="now-nowpanel-content"></div>
    `;
    document.body.insertBefore(sideNav, overlay.nextSibling);

    // Create base wrapper
    const baseWrapper = document.createElement("div");
    baseWrapper.id = "now-widget-basewrapper";
    while (document.body.children.length > 2) {
        baseWrapper.appendChild(document.body.children[2]);
    }
    document.body.insertBefore(baseWrapper, document.body.children[2]);

    // Create container for NowButton inside baseWrapper
    const nowButtonContainer = document.createElement("div");
    nowButtonContainer.id = "now-button-container";
    nowButtonContainer.className = `now-widget-button-container ${position}`;
    baseWrapper.appendChild(nowButtonContainer);

    // Render NowButton
    const nowButtonRoot = createRoot(nowButtonContainer);
    nowButtonRoot.render(
        <NowButton
            onClick={() => setIsOpen(true)}
size = { buttonSize }
color = { buttonColor }
backgroundColor = "transparent"
updated = { posts.length > 0 }
    />
    );

// Event listeners for closing the panel
const closeBtn = sideNav.querySelector(".closebtn");
closeBtn?.addEventListener("click", () => setIsOpen(false));

// Close panel when clicking on overlay
overlay.addEventListener("click", () => {
    if (!document.getElementById("now__nowpanel")?.classList.contains("closed")) {
        setIsOpen(false);
    }
});

// Prevent clicks inside the side panel from closing it
sideNav.addEventListener("click", (e) => {
    e.stopPropagation();
});

// Render NowPanelContent
const nowpanelContentDiv = sideNav.querySelector("#now-nowpanel-content");
let nowPanelRoot: Root | null = null;
if (nowpanelContentDiv) {
    nowPanelRoot = createRoot(nowpanelContentDiv);
    nowPanelRoot.render(
        <Suspense fallback={< div > Loading...</div>}>
            <NowPanelContent
                    userId={ userId }
token = { token }
posts = { posts }
user = { user }
    />
    </Suspense>
        );
    }

return { nowButtonRoot, nowPanelRoot };
};

export const animatePanel = (isOpen: boolean, position: "left" | "right") => {
    requestAnimationFrame(() => {
        const sideNav = document.getElementById("now__nowpanel");
        const baseWrapper = document.getElementById("now-widget-basewrapper");
        const overlay = document.getElementById("now__overlay");
        if (sideNav && baseWrapper && overlay) {
            if (isOpen) {
                sideNav.classList.add("open");
                overlay.classList.add("active");
                baseWrapper.style.transform = position === "left" ? "translateX(30%)" : "translateX(-30%)";
            } else {
                sideNav.classList.remove("open");
                overlay.classList.remove("active");
                baseWrapper.style.transform = "translateX(0)";
            }
        }
    });
};

export const cleanupWidget = ({ nowButtonRootRef, nowPanelRootRef }: CleanupWidgetParams) => {
    const sideNav = document.getElementById("now__nowpanel");
    const baseWrapper = document.getElementById("now-widget-basewrapper");
    const style = document.querySelector("style");
    const nowButtonContainer = document.getElementById("now-button-container");
    const overlay = document.getElementById("now__overlay");

    if (sideNav) sideNav.remove();
    if (baseWrapper) {
        while (baseWrapper.firstChild) {
            document.body.appendChild(baseWrapper.firstChild);
        }
        baseWrapper.remove();
    }
    if (style) style.remove();
    if (nowButtonContainer) {
        nowButtonRootRef.current?.unmount();
        nowButtonContainer.remove();
    }
    if (overlay) overlay.remove();

    // Unmount NowPanelContent
    if (nowPanelRootRef.current) {
        nowPanelRootRef.current.unmount();
    }
};

export function generateApiKey({ userId, expiresIn = 86400 }: ApiKeyOptions): string {
    const secret = process.env.API_KEY_SECRET;
    if (!secret) {
        throw new Error('API_KEY_SECRET is not defined');
    }
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;
    const data = `${userId}|${expirationTime}`;
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(data).digest('hex');
    return `${data}|${signature}`;
}

export function verifyApiKey(apiKey: string): { isValid: boolean; userId?: string } {
    const secret = process.env.API_KEY_SECRET;
    if (!secret) {
        throw new Error('API_KEY_SECRET is not defined');
    }
    const [userId, expirationTime, signature] = apiKey.split('|');
    if (!userId || !expirationTime || !signature) {
        return { isValid: false };
    }
    const data = `${userId}|${expirationTime}`;
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(data).digest('hex');
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) &&
        parseInt(expirationTime, 10) > Math.floor(Date.now() / 1000);
    return { isValid, userId: isValid ? userId : undefined };
}

export function generateWidgetToken(userId: string): string {
    const secret = process.env.WIDGET_SECRET_KEY;
    if (!secret) {
        throw new Error('WIDGET_SECRET_KEY is not defined');
    }
    return jwt.sign({ userId }, secret, { expiresIn: '30d' });
}

export function verifyWidgetToken(token: string, userId: string): boolean {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        return decoded.userId === userId;
    } catch (error) {
        return false;
    }
}