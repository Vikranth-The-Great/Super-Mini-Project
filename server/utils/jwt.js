const crypto = require('crypto');

const base64urlEncode = (input) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const base64urlDecode = (input) => {
  const normalized = String(input).replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padLength), 'base64').toString('utf8');
};

const parseExpiresIn = (expiresIn) => {
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) return expiresIn;
  const raw = String(expiresIn || '').trim();
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) return 24 * 60 * 60;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[unit];
};

const signJwt = (payload, secret, options = {}) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = parseExpiresIn(options.expiresIn);

  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    iat: nowSec,
    exp: nowSec + ttl,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedBody = base64urlEncode(JSON.stringify(body));
  const unsigned = `${encodedHeader}.${encodedBody}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(unsigned)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsigned}.${signature}`;
};

const verifyJwt = (token, secret) => {
  const raw = String(token || '');
  const parts = raw.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(unsigned)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuffer = Buffer.from(encodedSignature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(base64urlDecode(encodedPayload));
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < nowSec) {
    throw new Error('Token expired');
  }

  return payload;
};

module.exports = {
  signJwt,
  verifyJwt,
};
