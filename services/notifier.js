const log = require('./logger');
const mailer = require('./mailer');

let lastErrors = [];
const ERROR_NOTIFY_ENABLE = (process.env.ERROR_NOTIFY_ENABLED === 'on');

class ErrorNotifier {
    push(error) {
        console.error(error);
        log.error(error);
        if(!ERROR_NOTIFY_ENABLE){
            return;
        }
        lastErrors.push([Date.now(), error])
        this.updateLastErrors();

        if(lastErrors.length > 5){
            mailer.sendMailToAdmin('ErrorNotifier: Too many errors on BlockFX API', 'On last one hour we get more 5 errors: \n'+lastErrors+'.'
                +'\nPlease see log in logs directory for get more information.')
            lastErrors = [];
        }
    }

    pushForce(error) {
        console.error(error);
        log.error(error);
        if(!ERROR_NOTIFY_ENABLE){
            return;
        }
        mailer.sendMailToAdmin('ErrorNotifier: Fatal Error on BlockFX API', 'Information about error: '+error)
    }

    updateLastErrors(){
        lastErrors = lastErrors.filter((dateError) => {
            const [errorCreated, error] = dateError;
            const diff = Date.now()  - errorCreated;
            return (diff < (60 * 60));
        });

        return lastErrors;
    }
}

module.exports = notifier = new ErrorNotifier();