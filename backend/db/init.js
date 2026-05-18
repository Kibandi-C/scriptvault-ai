// ScriptVault AI — MongoDB initialisation
db = db.getSiblingDB('scriptvault');

db.createCollection('users');
db.createCollection('scripts');
db.createCollection('transactions');

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { sparse: true });
db.scripts.createIndex({ user_id: 1, created_at: -1 });
db.transactions.createIndex({ checkout_request_id: 1 }, { unique: true });
