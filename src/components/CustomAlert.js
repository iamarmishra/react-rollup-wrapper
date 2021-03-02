import React from 'react';
import { Alert } from '@webiny/ui/Alert';

import styles from './CustomAlert.css';

const CustomAlert = (props) => {
    return (
        <div className={styles.customAlert}>
            <Alert {...props} type={props.type} title={props.title}>
                {props.children}
            </Alert>
        </div>
    );
};

export default CustomAlert;
