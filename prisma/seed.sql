INSERT INTO "User" ("username", "password", "name", "role", "isActive", "isOnline", "updatedAt") 
VALUES ('admin', '$2b$10$serQA0A8RUrMUL8xgSAy/ewmjxuKqVd0Q/xkDcpu9clqHtF197nKq', 'Administrador', 'ADMIN', true, false, NOW())
ON CONFLICT ("username") DO NOTHING;
