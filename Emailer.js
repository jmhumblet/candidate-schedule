class Emailer {
    br = "%0D%0A";
    constructor(template) {
        this.template = template;
    }

    buildSubject(interviewTimeslot) {
        return this.replacePlaceholders(this.template.subject, interviewTimeslot);
    }

    buildBody(interviewTimeslot) {
        return this.replacePlaceholders(this.template.body, interviewTimeslot);
    }

    replacePlaceholders(text, obj) {
        return text.replace(/\{([^}]+)\}/g, (_, key) => {
            const keys = key.split('.');
            let val = obj;
            while (keys.length) {
                const k = keys.shift();
                if (val.hasOwnProperty(k)) {
                    val = val[k];
                } else {
                    return '';
                }
            }
            return val;
        }).replace(/\r\n|\n/g, this.br);
    };
}

export default Emailer;