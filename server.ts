import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const APP_URL = process.env.APP_URL || 'https://ais-dev-m4ztqwcazbjkhs6ozdrlro-474861943942.us-east5.run.app';
const SHARED_APP_URL = 'https://ais-pre-m4ztqwcazbjkhs6ozdrlro-474861943942.us-east5.run.app';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Helper to get GitHub token from request header
  const getGitHubToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  };

  // 1. Config status endpoint
  app.get('/api/auth/config', (_req: Request, res: Response) => {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
    const hasClientSecret = Boolean(process.env.GITHUB_CLIENT_SECRET || process.env.CLIENT_SECRET);
    const redirectUri = `${APP_URL}/auth/callback`;
    const sharedRedirectUri = `${SHARED_APP_URL}/auth/callback`;

    res.json({
      configured: Boolean(clientId && hasClientSecret),
      clientId: clientId ? `${clientId.slice(0, 6)}...` : '',
      appUrl: APP_URL,
      sharedAppUrl: SHARED_APP_URL,
      redirectUri,
      sharedRedirectUri,
    });
  });

  // 2. OAuth URL endpoint
  app.get('/api/auth/url', (req: Request, res: Response) => {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || (req.query.client_id as string);
    const redirectUri = `${APP_URL}/auth/callback`;

    if (!clientId) {
      res.status(400).json({
        error: 'Missing GITHUB_CLIENT_ID',
        message: 'GitHub OAuth Client ID is not configured.',
        redirectUri,
      });
      return;
    }

    const state = Math.random().toString(36).substring(2, 15);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo,read:user,user:email,workflow',
      state,
      allow_signup: 'true',
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url, state, redirectUri });
  });

  // 3. Callback handlers for OAuth (handling both /auth/callback and /auth/callback/)
  const oauthCallbackHandler = async (req: Request, res: Response) => {
    const { code, error, error_description } = req.query;

    if (error) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Error de Autenticación con GitHub</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0d1117; color: #f0f6fc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; max-width: 420px; text-align: center; }
              h2 { color: #f85149; margin-top: 0; }
              p { color: #8b949e; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Error al conectar con GitHub</h2>
              <p>${error_description || error || 'Ocurrió un error en la autorización.'}</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(error_description || error)} }, '*');
                  setTimeout(() => window.close(), 3000);
                }
              </script>
            </div>
          </body>
        </html>
      `);
      return;
    }

    if (!code) {
      res.status(400).send('No authorization code provided');
      return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; background: #0d1117; color: #f0f6fc; padding: 30px; text-align: center;">
            <h2 style="color: #f85149;">Faltan credenciales del servidor</h2>
            <p>Se requiere configurar GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET en las variables de entorno.</p>
          </body>
        </html>
      `);
      return;
    }

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'GitHub-Connect-Hub/1.0',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await response.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      const accessToken = tokenData.access_token;

      // Fetch basic user profile
      let userInfo: any = null;
      try {
        const userRes = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'GitHub-Connect-Hub/1.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        if (userRes.ok) {
          userInfo = await userRes.json();
        }
      } catch (e) {
        console.error('Failed to pre-fetch user info in callback:', e);
      }

      res.send(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <title>Conectado con GitHub</title>
            <style>
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #0d1117;
                color: #f0f6fc;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .box {
                background: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 32px;
                text-align: center;
                max-width: 380px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              }
              .icon {
                font-size: 42px;
                margin-bottom: 16px;
                display: inline-block;
              }
              h2 {
                margin: 0 0 10px;
                font-size: 20px;
                font-weight: 600;
              }
              p {
                color: #8b949e;
                font-size: 14px;
                margin: 0;
              }
              .spinner {
                margin: 16px auto 0;
                width: 24px;
                height: 24px;
                border: 2px solid #30363d;
                border-top-color: #238636;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="box">
              <div class="icon">✨</div>
              <h2>¡Conexión Exitosa con GitHub!</h2>
              <p>Tu cuenta ha sido vinculada correctamente. Cerrando esta ventana...</p>
              <div class="spinner"></div>
            </div>
            <script>
              const payload = {
                type: 'OAUTH_AUTH_SUCCESS',
                token: ${JSON.stringify(accessToken)},
                user: ${JSON.stringify(userInfo)}
              };
              if (window.opener) {
                window.opener.postMessage(payload, '*');
                setTimeout(() => {
                  window.close();
                }, 600);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; background: #0d1117; color: #f0f6fc; padding: 30px; text-align: center;">
            <h2 style="color: #f85149;">Error de autenticación</h2>
            <p>${err.message || 'Error al canjear el código por un token'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </body>
        </html>
      `);
    }
  };

  app.get('/auth/callback', oauthCallbackHandler);
  app.get('/auth/callback/', oauthCallbackHandler);

  // 4. API Proxy for GitHub Endpoints (avoids CORS issues and adds required headers)
  app.get('/api/github/user', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const username = req.query.username as string;

    const targetUrl = username ? `https://api.github.com/users/${encodeURIComponent(username)}` : 'https://api.github.com/user';
    
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Connect-Hub/1.0',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(targetUrl, { headers });
      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json(data);
        return;
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch user data' });
    }
  });

  // 5. Repositories
  app.get('/api/github/repos', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const username = req.query.username as string;
    const sort = (req.query.sort as string) || 'updated';
    const perPage = (req.query.per_page as string) || '100';

    const targetUrl = username
      ? `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=${sort}&per_page=${perPage}`
      : `https://api.github.com/user/repos?sort=${sort}&per_page=${perPage}&affiliation=owner,collaborator,organization_member`;

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Connect-Hub/1.0',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(targetUrl, { headers });
      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json(data);
        return;
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch repositories' });
    }
  });

  // 6. User Activity / Events
  app.get('/api/github/events', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const username = req.query.username as string;

    if (!username && !token) {
      res.status(400).json({ error: 'Username or token required' });
      return;
    }

    const targetUrl = username
      ? `https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=30`
      : 'https://api.github.com/user/events?per_page=30';

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Connect-Hub/1.0',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(targetUrl, { headers });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Repo Details: Commits, Issues, Readme, Contents
  app.get('/api/github/repo-data', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const owner = req.query.owner as string;
    const repo = req.query.repo as string;
    const pathQuery = (req.query.path as string) || '';

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Connect-Hub/1.0',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const [repoRes, commitsRes, issuesRes, readmeRes, contentsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=15`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathQuery}`, { headers }),
      ]);

      const repoData = repoRes.ok ? await repoRes.json() : null;
      const commits = commitsRes.ok ? await commitsRes.json() : [];
      const issues = issuesRes.ok ? await issuesRes.json() : [];
      const readme = readmeRes.ok ? await readmeRes.json() : null;
      const contents = contentsRes.ok ? await contentsRes.json() : [];

      res.json({
        repo: repoData,
        commits,
        issues,
        readme,
        contents,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 8. Create Issue
  app.post('/api/github/create-issue', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const { owner, repo, title, body, labels } = req.body;

    if (!token) {
      res.status(401).json({ error: 'Token is required to create an issue' });
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'GitHub-Connect-Hub/1.0',
        },
        body: JSON.stringify({ title, body, labels }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 9. Star/Unstar repository
  app.post('/api/github/star', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const { owner, repo, action } = req.body;

    if (!token) {
      res.status(401).json({ error: 'Token is required to star/unstar' });
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/user/starred/${owner}/${repo}`, {
        method: action === 'unstar' ? 'DELETE' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Connect-Hub/1.0',
          'Content-Length': '0',
        },
      });

      res.json({ success: response.status === 204 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 10. Check if repository is starred
  app.get('/api/github/is-starred', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const owner = req.query.owner as string;
    const repo = req.query.repo as string;

    if (!token || !owner || !repo) {
      res.json({ starred: false });
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/user/starred/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Connect-Hub/1.0',
        },
      });
      res.json({ starred: response.status === 204 });
    } catch {
      res.json({ starred: false });
    }
  });

  // 11. Create a new repository on GitHub
  app.post('/api/github/create-repo', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const { name, description, isPrivate, autoInit } = req.body;

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'GitHub-Connect-Hub/1.0',
        },
        body: JSON.stringify({
          name,
          description,
          private: Boolean(isPrivate),
          auto_init: Boolean(autoInit),
        }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 12. Check repository details and permissions
  app.get('/api/github/check-repo', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const owner = req.query.owner as string;
    const repo = req.query.repo as string;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Connect-Hub/1.0',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json(data);
        return;
      }

      res.json({
        exists: true,
        fullName: data.full_name,
        description: data.description,
        isPrivate: data.private,
        defaultBranch: data.default_branch,
        permissions: data.permissions || { admin: true, push: true, pull: true },
        openIssuesCount: data.open_issues_count,
        htmlUrl: data.html_url,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 13. Update / Create README.md in a repository
  app.post('/api/github/update-readme', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const { owner, repo, content, commitMessage, branch } = req.body;

    if (!token) {
      res.status(401).json({ error: 'GitHub Token is required to commit changes' });
      return;
    }
    if (!owner || !repo || !content) {
      res.status(400).json({ error: 'owner, repo and content are required' });
      return;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Connect-Hub/1.0',
      };

      // 1. Check if README.md already exists to get its SHA
      let fileSha: string | undefined;
      const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md${branch ? `?ref=${branch}` : ''}`, { headers });
      if (getRes.ok) {
        const fileData = await getRes.json();
        fileSha = fileData.sha;
      }

      // 2. Put file with base64 encoded content (UTF-8 safe)
      const base64Content = Buffer.from(content, 'utf-8').toString('base64');
      const bodyPayload: any = {
        message: commitMessage || 'docs: update README with MVC Architecture & SPEC Methodology',
        content: base64Content,
      };
      if (fileSha) {
        bodyPayload.sha = fileSha;
      }
      if (branch) {
        bodyPayload.branch = branch;
      }

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const putData = await putRes.json();
      if (!putRes.ok) {
        res.status(putRes.status).json(putData);
        return;
      }

      res.json({
        success: true,
        commit: putData.commit,
        contentUrl: putData.content?.html_url,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 14. Batch create issues
  app.post('/api/github/batch-create-issues', async (req: Request, res: Response) => {
    const token = getGitHubToken(req);
    const { owner, repo, issues } = req.body;

    if (!token) {
      res.status(401).json({ error: 'GitHub Token is required to create issues' });
      return;
    }
    if (!owner || !repo || !Array.isArray(issues)) {
      res.status(400).json({ error: 'owner, repo and issues array are required' });
      return;
    }

    const results = [];
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'GitHub-Connect-Hub/1.0',
    };

    for (const item of issues) {
      try {
        const resCreate = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: item.title,
            body: item.body,
            labels: item.labels || [],
          }),
        });
        const issueData = await resCreate.json();
        if (resCreate.ok) {
          results.push({
            success: true,
            title: item.title,
            number: issueData.number,
            url: issueData.html_url,
          });
        } else {
          results.push({
            success: false,
            title: item.title,
            error: issueData.message || 'Failed to create issue',
          });
        }
        // Small delay to prevent GitHub rate-limiting or anti-abuse trigger
        await new Promise((r) => setTimeout(r, 600));
      } catch (err: any) {
        results.push({
          success: false,
          title: item.title,
          error: err.message,
        });
      }
    }

    res.json({ results });
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GitHub Connect server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
