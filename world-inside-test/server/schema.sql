CREATE TABLE IF NOT EXISTS members (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT NOT NULL DEFAULT '', language TEXT NOT NULL DEFAULT '',
 skills TEXT NOT NULL DEFAULT '', needs TEXT NOT NULL DEFAULT '', goal TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '',
 visible INTEGER NOT NULL DEFAULT 0 CHECK(visible IN (0,1)), updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
 id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('project','offer','request','event','promo','mentor')),
 title TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS member_visible_updated ON members(visible,updated DESC);
CREATE INDEX IF NOT EXISTS post_kind_status_created ON posts(kind,status,created DESC);
CREATE INDEX IF NOT EXISTS post_owner_created ON posts(owner,created DESC);
