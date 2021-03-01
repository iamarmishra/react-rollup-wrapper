import React from 'react';
import { ButtonPrimary } from '@webiny/ui/Button';
import * as styles from './CustomButton.css';

const CustomButton = props => {
    return (
        <div className={styles.customButton}>
            <ButtonPrimary {...props}>Finish Editing & Publishing</ButtonPrimary>;
        </div>
    );
};

export default CustomButton;
