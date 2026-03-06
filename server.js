const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const FEEDBACK_PATH = path.join(ROOT, "data", "feedbacks.json");

const CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm"
};

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
}

function sanitizeFeedback(raw) {
    if (!raw || typeof raw !== "object") return null;
    const name = String(raw.name || "").trim().slice(0, 60);
    const message = String(raw.message || "").trim().slice(0, 500);
    const rating = Math.max(1, Math.min(5, Number(raw.rating) || 0));
    if (!name || !message || !rating) return null;
    return {
        name,
        message,
        rating,
        createdAt: new Date().toISOString()
    };
}

async function readFeedbackList() {
    try {
        const text = await fs.readFile(FEEDBACK_PATH, "utf8");
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeFeedbackList(list) {
    await fs.writeFile(FEEDBACK_PATH, `${JSON.stringify(list, null, 2)}\n`, "utf8");
}

async function handleApi(req, res) {
    if (req.url !== "/api/feedbacks") return false;

    if (req.method === "GET") {
        const list = await readFeedbackList();
        sendJson(res, 200, list);
        return true;
    }

    if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 1e6) req.destroy();
        });

        req.on("end", async () => {
            try {
                const payload = JSON.parse(body || "{}");
                const entry = sanitizeFeedback(payload);
                if (!entry) {
                    sendJson(res, 400, { error: "Invalid feedback payload." });
                    return;
                }

                const list = await readFeedbackList();
                list.unshift(entry);
                await writeFeedbackList(list);
                sendJson(res, 201, { ok: true, feedback: entry });
            } catch {
                sendJson(res, 400, { error: "Invalid JSON body." });
            }
        });

        return true;
    }

    sendJson(res, 405, { error: "Method not allowed." });
    return true;
}

function resolvePublicPath(urlPath) {
    let pathname = decodeURIComponent(urlPath.split("?")[0]);
    if (pathname === "/") pathname = "/index.html";

    const normalized = path.normalize(pathname).replace(/^([.][.][/\\])+/, "");
    const relPath = normalized.replace(/^[/\\]+/, "");
    const absPath = path.join(ROOT, relPath);

    if (!absPath.startsWith(ROOT)) return null;
    return absPath;
}

async function handleStatic(req, res) {
    const absPath = resolvePublicPath(req.url || "/");
    if (!absPath) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    try {
        const stat = await fs.stat(absPath);
        if (stat.isDirectory()) {
            res.writeHead(403);
            res.end("Forbidden");
            return;
        }

        const ext = path.extname(absPath).toLowerCase();
        const type = CONTENT_TYPES[ext] || "application/octet-stream";
        const content = await fs.readFile(absPath);
        res.writeHead(200, { "Content-Type": type });
        res.end(content);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
    }
}

const server = http.createServer(async (req, res) => {
    if (await handleApi(req, res)) return;
    await handleStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`CrossdaleArts server running at http://localhost:${PORT}`);
});
