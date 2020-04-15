function shuffleArray(array0) {
    const array = array0;
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function generateCode(Length) {
    const numberChars = '0123456789';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const allChars = numberChars + upperChars + lowerChars;
    let randPasswordArray = Array(Length);
    randPasswordArray[0] = numberChars;
    randPasswordArray[1] = upperChars;
    randPasswordArray[2] = lowerChars;
    randPasswordArray = randPasswordArray.fill(allChars, 3);
    return shuffleArray(randPasswordArray.map(x => x[Math.floor(Math.random() * x.length)])).join('');
}

module.exports = passwordService = {

    generateRandomCode: () => {
        return generateCode(15);
    },
    generateHash: async (password) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hashSync(password, salt);
    },
    checkPassword: async (firstPassword, secondPassword) => {
        return await bcrypt.compare(firstPassword, secondPassword);
    },

};