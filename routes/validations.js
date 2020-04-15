function _required(checkInstance, fieldName){
    return checkInstance.isLength({min:1}).withMessage(fieldName + ' is required.')
}

function _alphabetic(checkInstance, fieldName){
    return checkInstance.matches(/^[A-Za-z\s]+$/).withMessage(fieldName + ' must be alphabetic.');
}

function _alphabeticAndDotCommaDigits(checkInstance, fieldName){
    return checkInstance.matches(/^[A-Za-z\s\.\,\/\d]+$/).withMessage(fieldName + ' have wrong characters.');
}

function _validateGroup(){
    const [fieldName, fieldLabel, ...validations] = arguments;
    let check = check(fieldName);

    validations.forEach(validation => {
        check = validation(check, fieldLabel);
    });

    return check;
}

const beneficearyNameValidation  = _validateGroup("beneficearyName", "Beneficeary name", _required, _alphabeticAndDotCommaDigits);

const beneficearyAddressValidation =_validateGroup("beneficearyAddress", "Beneficeary address", _required, _alphabeticAndDotCommaDigits);

const bankNameValidation =_validateGroup("bankName", "Bank name", _required, _alphabeticAndDotCommaDigits);

const bankAddressValidation  =_validateGroup("bankAddress", "Bank address", _required, _alphabeticAndDotCommaDigits);


const IBANValidation  = _validateGroup("IBAN", "IBAN", _required);
    //.matches(/^([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?$/)
    //.withMessage('Bank name have wrong characters.');
//disabled

const bankSwiftBICcodeValidation  = _validateGroup("bankSwiftBICcode", "Swift/BIC code", _required);
    //.matches(/^([a-zA-Z]){4}(AF|AX|AL|DZ|AS|AD|AO|AI|AQ|AG|AR|AM|AW|AU|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BM|BT|BO|BA|BW|BV|BR|IO|BN|BG|BF|BI|KH|CM|CA|CV|KY|CF|TD|CL|CN|CX|CC|CO|KM|CG|CD|CK|CR|CI|HR|CU|CY|CZ|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|ET|FK|FO|FJ|FI|FR|GF|PF|TF|GA|GM|GE|DE|GH|GI|GR|GL|GD|GP|GU|GT|GG|GN|GW|GY|HT|HM|VA|HN|HK|HU|IS|IN|ID|IR|IQ|IE|IM|IL|IT|JM|JP|JE|JO|KZ|KE|KI|KP|KR|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MK|MG|MW|MY|MV|ML|MT|MH|MQ|MR|MU|YT|MX|FM|MD|MC|MC|MN|ME|MS|MA|MZ|MM|MA|NR|NP|NL|AN|NC|NZ|NI|NE|NG|NU|NF|MP|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PN|PL|PT|PR|QA|RE|RO|RU|RW|SH|KN|LC|PM|VC|WS|SM|ST|SA|SN|RS|SC|SL|SG|SK|SI|SB|SO|ZA|GS|ES|LK|SD|SR|SJ|SZ|SE|CH|SY|TW|TJ|TZ|TH|TL|TG|TK|TO|TT|TN|TR|TM|TC|TV|UG|UA|AE|GB|US|UM|UY|UZ|VU|VE|VN|VG|VI|WF|EH|YE|ZM|ZW)([0-9a-zA-Z]){2}([0-9a-zA-Z]{3})$
    //).withMessage('Bank name have wrong characters.');
//disabled

const bankCountryValidation  = _validateGroup("bankCountry", "Bank country", _required, _alphabetic);

const currencyValidation  = _validateGroup("currency", "Currency", _required, _alphabetic);

const referenceValidation  = _validateGroup("reference", "Reference", _required);

const bidValidation = check("bid", "Beneficeary id is required").not().isEmpty();

const beneficearyBankPostFormValidations = {
    beneficearyNameValidation,
    beneficearyAddressValidation,
    bankNameValidation,
    bankAddressValidation,
    IBANValidation,
    bankSwiftBICcodeValidation,
    bankCountryValidation,
    currencyValidation,
    referenceValidation
};

const beneficearyBlockchainPostFormValidations = {
    beneficearyNameValidation,
    bankAddressValidation,
    currencyValidation
};

export {
    beneficearyBankPostFormValidations,
    beneficearyBlockchainPostFormValidations,
    bidValidation


    //
    // beneficearyNameValidation,
    // beneficearyAddressValidation,
    // bankNameValidation,
    // bankAddressValidation,
    // IBANValidation,
    // bankSwiftBICcodeValidation,
    // bankCountryValidation,
    // currencyValidation,
    // referenceValidation
};