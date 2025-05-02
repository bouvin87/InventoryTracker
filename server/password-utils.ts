import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  console.log(`comparePasswords: Jämför lösenord...`);
  
  // Kontrollera att lagrad lösenordsträng är korrekt formaterad
  if (!stored || !stored.includes('.')) {
    console.log(`comparePasswords: Felaktigt lösenordsformat, saknar punkt: ${stored}`);
    return false;
  }
  
  const [hashed, salt] = stored.split(".");
  
  // Kontrollera att vi har både hash och salt
  if (!hashed || !salt) {
    console.log(`comparePasswords: Ingen hash eller salt: hash=${!!hashed}, salt=${!!salt}`);
    return false;
  }
  
  console.log(`comparePasswords: Hash längd=${hashed.length}, salt längd=${salt.length}`);
  
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log(`comparePasswords: Jämförelse resultat=${result}`);
    return result;
  } catch (error) {
    console.error(`comparePasswords: Fel vid jämförelse: ${error}`);
    return false;
  }
}