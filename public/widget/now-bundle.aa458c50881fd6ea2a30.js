"use strict";
(this["webpackChunkNowNowNowWidget"] = this["webpackChunkNowNowNowWidget"] || []).push([[254],{

/***/ 254:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ now_widget_SidePanelContent)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/react@18.3.1/node_modules/react/index.js
var react = __webpack_require__(758);
// EXTERNAL MODULE: ./node_modules/.pnpm/@radix-ui+react-avatar@1.1.0_@types+react-dom@18.3.0_@types+react@18.3.10_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-avatar/dist/index.mjs
var dist = __webpack_require__(593);
// EXTERNAL MODULE: ./node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(526);
// EXTERNAL MODULE: ./node_modules/.pnpm/tailwind-merge@2.5.2/node_modules/tailwind-merge/dist/bundle-mjs.mjs
var bundle_mjs = __webpack_require__(190);
;// ./src/lib/utils.ts



function cn(...inputs) {
    return (0,bundle_mjs/* twMerge */.QP)((0,clsx/* clsx */.$)(inputs));
}
function formatRelativeDate(from) {
    const currentDate = new Date();
    if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
        return formatDistanceToNowStrict(from, { addSuffix: true });
    }
    else {
        if (currentDate.getFullYear() === from.getFullYear()) {
            return formatDate(from, "MMM d");
        }
        else {
            return formatDate(from, "MMM d, yyyy");
        }
    }
}
function formatNumber(n) {
    return Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(n);
}
function slugify(input) {
    return input
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

;// ./src/components/ui/avatar.tsx
"use client";
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};



const Avatar = react.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (react.createElement(dist/* Root */.bL, Object.assign({ ref: ref, className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className) }, props)));
});
Avatar.displayName = dist/* Root */.bL.displayName;
const AvatarImage = react.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (react.createElement(dist/* Image */._V, Object.assign({ ref: ref, className: cn("aspect-square h-full w-full", className) }, props)));
});
AvatarImage.displayName = dist/* Image */._V.displayName;
const AvatarFallback = react.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (react.createElement(dist/* Fallback */.H4, Object.assign({ ref: ref, className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className) }, props)));
});
AvatarFallback.displayName = dist/* Fallback */.H4.displayName;


// EXTERNAL MODULE: ./node_modules/.pnpm/@radix-ui+react-scroll-area@1.1.0_@types+react-dom@18.3.0_@types+react@18.3.10_react-dom@18.3_ei4z3msblnkjpioxrrschxzmm4/node_modules/@radix-ui/react-scroll-area/dist/index.mjs + 4 modules
var react_scroll_area_dist = __webpack_require__(222);
;// ./src/components/ui/scroll-area.tsx
"use client";
var scroll_area_rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};



const ScrollArea = react.forwardRef((_a, ref) => {
    var { className, children } = _a, props = scroll_area_rest(_a, ["className", "children"]);
    return (react.createElement(react_scroll_area_dist/* Root */.bL, Object.assign({ ref: ref, className: cn("relative overflow-hidden", className) }, props),
        react.createElement(react_scroll_area_dist/* Viewport */.LM, { className: "h-full w-full rounded-[inherit]" }, children),
        react.createElement(ScrollBar, null),
        react.createElement(react_scroll_area_dist/* Corner */.OK, null)));
});
ScrollArea.displayName = react_scroll_area_dist/* Root */.bL.displayName;
const ScrollBar = react.forwardRef((_a, ref) => {
    var { className, orientation = "vertical" } = _a, props = scroll_area_rest(_a, ["className", "orientation"]);
    return (react.createElement(react_scroll_area_dist/* ScrollAreaScrollbar */.VM, Object.assign({ ref: ref, orientation: orientation, className: cn("flex touch-none select-none transition-colors", orientation === "vertical" &&
            "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" &&
            "h-2.5 flex-col border-t border-t-transparent p-[1px]", className) }, props),
        react.createElement(react_scroll_area_dist/* ScrollAreaThumb */.lr, { className: "relative flex-1 rounded-full bg-border" })));
});
ScrollBar.displayName = react_scroll_area_dist/* ScrollAreaScrollbar */.VM.displayName;


// EXTERNAL MODULE: ./node_modules/.pnpm/class-variance-authority@0.7.0/node_modules/class-variance-authority/dist/index.mjs + 1 modules
var class_variance_authority_dist = __webpack_require__(808);
;// ./src/components/ui/typography.tsx
var typography_rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/* eslint-disable @typescript-eslint/no-explicit-any */



const fixedForwardRef = react.forwardRef;
const typographyVariants = (0,class_variance_authority_dist/* cva */.F)("", {
    variants: {
        variant: {
            h1: "scroll-m-20 font-caption text-4xl font-extrabold tracking-tight lg:text-5xl",
            h2: "scroll-m-20 font-caption text-3xl font-semibold tracking-tight transition-colors",
            h3: "scroll-m-20 font-caption text-xl font-semibold tracking-tight",
            p: "leading-7 [&:not(:first-child)]:mt-6",
            default: "",
            quote: "mt-6 border-l-2 pl-6 italic",
            code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
            lead: "text-xl text-muted-foreground",
            large: "text-lg font-semibold",
            small: "text-sm font-medium leading-none ",
            muted: "text-sm text-muted-foreground",
            link: "font-medium text-cyan-600 hover:underline dark:text-primary",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
const defaultElementMapping = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    p: "p",
    quote: "p",
    code: "code",
    lead: "p",
    large: "p",
    small: "p",
    muted: "p",
    link: "a",
    default: "p",
};
/**
 * The Typography component is useful to add Text to your page
 *
 * Usage :
 *
 * ```tsx
 * <Typography variant="h1">Hello World</Typography>
 * <Typography variant="h2" as="a" href="#">Hello World</Typography>
 * <Typography variant="large" as={Link} href="#">Hello World</Typography>
 * ```
 *
 * You can use the `as` prop to define the element type of the component
 * `as` can be a string or a component
 *
 * @param params The parameters of the component
 * @param ref The ref of the element. Untyped because it's a generic
 * @returns
 */
const InnerTypography = (_a, ref) => {
    var { variant = "default", className, as } = _a, props = typography_rest(_a, ["variant", "className", "as"]);
    const Comp = as !== null && as !== void 0 ? as : defaultElementMapping[variant !== null && variant !== void 0 ? variant : "default"];
    return (react.createElement(Comp, Object.assign({}, props, { className: cn(typographyVariants({ variant }), className), ref: ref })));
};
const Typography = fixedForwardRef(InnerTypography);

// EXTERNAL MODULE: ./node_modules/.pnpm/node-cache@5.1.2/node_modules/node-cache/index.js
var node_cache = __webpack_require__(619);
var node_cache_default = /*#__PURE__*/__webpack_require__.n(node_cache);
;// ./src/lib/cache.ts

const cache = new (node_cache_default())({ stdTTL: 300 }); // Cache for 5 minutes
function getCachedData(key, fetchData) {
    return new Promise((resolve, reject) => {
        const cachedData = cache.get(key);
        if (cachedData) {
            resolve(cachedData);
        }
        else {
            fetchData()
                .then((data) => {
                cache.set(key, data);
                resolve(data);
            })
                .catch(reject);
        }
    });
}

// EXTERNAL MODULE: ./node_modules/.pnpm/lucide-react@0.441.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/message-square.js
var message_square = __webpack_require__(378);
// EXTERNAL MODULE: ./node_modules/.pnpm/lucide-react@0.441.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/bookmark.js
var bookmark = __webpack_require__(587);
// EXTERNAL MODULE: ./node_modules/.pnpm/lucide-react@0.441.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/thumbs-up.js
var thumbs_up = __webpack_require__(638);
;// ./now-widget/SidePanelContent.tsx
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};






const SidePanelContent = ({ userId, token, posts: initialPosts, user: initialUser, }) => {
    var _a, _b;
    const [posts, setPosts] = (0,react.useState)(initialPosts);
    const [user, setUser] = (0,react.useState)(initialUser);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const API_BASE_URL =  false || "http://localhost:3000";
    (0,react.useEffect)(() => {
        const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = yield getCachedData(`userData_${userId}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    const response = yield fetch(`${API_BASE_URL}/api/widget/user-data?userId=${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                }));
                if (data.success) {
                    setPosts(data.data.recentPosts);
                    setUser(data.data.user);
                }
                else {
                    throw new Error(data.error || "Failed to fetch data");
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "An unexpected error occurred");
            }
            finally {
                setIsLoading(false);
            }
        });
        fetchData();
    }, [userId, token, API_BASE_URL]);
    if (isLoading)
        return react.createElement("div", { className: "text-white" }, "Loading...");
    if (error)
        return react.createElement("div", { className: "text-white" },
            "Error: ",
            error);
    return (react.createElement("div", { className: "size-full border-r bg-gray-900" },
        react.createElement("div", { className: "border-b border-gray-800 p-4" },
            react.createElement("div", { className: "flex items-center space-x-4" },
                react.createElement(Avatar, null,
                    react.createElement(AvatarImage, { src: (user === null || user === void 0 ? void 0 : user.image) || "", alt: (user === null || user === void 0 ? void 0 : user.displayName) || (user === null || user === void 0 ? void 0 : user.name) || "" }),
                    react.createElement(AvatarFallback, null, ((_a = user === null || user === void 0 ? void 0 : user.displayName) === null || _a === void 0 ? void 0 : _a[0]) || ((_b = user === null || user === void 0 ? void 0 : user.name) === null || _b === void 0 ? void 0 : _b[0]) || "")),
                react.createElement("div", null,
                    react.createElement(Typography, { variant: "h2", className: "text-lg font-semibold text-white" }, (user === null || user === void 0 ? void 0 : user.displayName) || (user === null || user === void 0 ? void 0 : user.name)),
                    react.createElement(Typography, { variant: "p", className: "text-sm text-gray-400" }, user === null || user === void 0 ? void 0 : user.bio)))),
        react.createElement(ScrollArea, { className: "h-[calc(100vh-120px)]" },
            react.createElement("div", { className: "space-y-6 p-4" }, posts.map((post) => (react.createElement("div", { key: post.id, className: "space-y-2" },
                react.createElement(Typography, { variant: "small", className: "text-sm text-gray-400" }, new Date(post.createdAt).toLocaleString()),
                react.createElement(Typography, { variant: "p", className: "text-sm text-white" }, post.content),
                react.createElement("div", { className: "flex items-center space-x-4 text-xs text-gray-400" },
                    react.createElement("div", { className: "flex items-center space-x-1" },
                        react.createElement(message_square/* default */.A, { className: "size-3" }),
                        react.createElement("span", null, post._count.comments)),
                    react.createElement("div", { className: "flex items-center space-x-1" },
                        react.createElement(bookmark/* default */.A, { className: "size-3" }),
                        react.createElement("span", null, post._count.bookmarks)),
                    react.createElement("div", { className: "flex items-center space-x-1" },
                        react.createElement(thumbs_up/* default */.A, { className: "size-3" }),
                        react.createElement("span", null, post._count.likes))))))))));
};
/* harmony default export */ const now_widget_SidePanelContent = (SidePanelContent);


/***/ })

}]);
//# sourceMappingURL=now-bundle.aa458c50881fd6ea2a30.js.map