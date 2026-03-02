// src/utils/base62.js

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = alphabet.length; // 62

// Encoder: Turns ID (1005) -> Short Code ("g7z")
// logic: Repeatedly divide by 62 and map remainders to the alphabet
export const encode = (num) => {
    let encoded = '';
    if (num === 0) return alphabet[0];

    while (num > 0) {
        const remainder = num % base;
        encoded = alphabet[remainder] + encoded;
        num = Math.floor(num / base);
    }
    return encoded;
};

// Decoder: Turns Short Code ("g7z") -> ID (1005)
// logic: Reverse math (used if you want to find ID from code)
export const decode = (str) => {
    let decoded = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const value = alphabet.indexOf(char);
        decoded = decoded * base + value;
    }
    return decoded;
};