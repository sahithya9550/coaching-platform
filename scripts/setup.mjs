import {existsSync,writeFileSync} from 'node:fs';
import {randomBytes,scryptSync} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
if(existsSync('.env')){console.log('.env already exists. Keep it private. Start with npm start.');process.exit(0)}
const rl=createInterface({input:process.stdin,output:process.stdout});
console.log('Choose an admin password of at least 12 characters. Input is visible in your local terminal.');
let password=await rl.question('Admin password: ');if(password.length<12){rl.close();console.error('Use at least 12 characters. Run setup again.');process.exit(1)}const confirm=await rl.question('Confirm password: ');rl.close();if(password!==confirm){console.error('Passwords do not match. Run setup again.');process.exit(1)}
const salt=randomBytes(16).toString('hex'),hash=scryptSync(password,salt,64).toString('hex');
writeFileSync('.env',`DB_PROVIDER=sqlite\nADMIN_PASSWORD_HASH=${salt}:${hash}\nSESSION_SECRET=${randomBytes(48).toString('hex')}\nPORT=3000\n`,{mode:0o600});console.log('Setup complete. Your password hash is stored locally in .env. Run npm run build, then npm start.');
