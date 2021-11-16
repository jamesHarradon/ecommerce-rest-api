const { scryptSync, randomBytes, timingSafeEqual } = require('crypto');

// you can simply encrypt a password using sha256 to convert it into a hash but apparently it is not secure enough for passwords.
// the below encrypt function encrypts a user password with 'salt' which is a random value which is added to a password before it is hashed. This makes it harder to guess

const encrypt = (password) => {
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');
    const passwordEncrypted = `${salt}:${hashedPassword}`;
    return passwordEncrypted;
}

//decrypt function below converts the entered password to the hash with the same salt and compares it with the same password found in the database.

const decryptIsMatch = (enteredPassword, userPassword) => {
    const [salt, key] = userPassword.split(':');
    const hashedBuffer = scryptSync(enteredPassword, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    const match = timingSafeEqual(hashedBuffer, keyBuffer);
    if (match) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    encrypt,
    decryptIsMatch
}