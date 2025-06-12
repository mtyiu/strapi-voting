/**
 *
 * Entity Details
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    Flex,
    Typography
} from '@strapi/design-system';
import { ArrowClockwise, WarningCircle, Check } from '@strapi/icons';

const getMessage = (message, initial) => message || initial

const ConfirmationDialog = ({
    isVisible = false,
    isActionAsync = false,
    children,
    onConfirm,
    onCancel,
    header,
    labelCancel,
    labelConfirm,
    iconConfirm
}) => (
    <Dialog.Root onClose={onCancel} title={header || getMessage('compontents.confirmation.dialog.header', 'Confirmation')} isOpen={isVisible}>
        <Dialog.Trigger>
            <Button variant="danger-light" startIcon={<ArrowClockwise />}>
                Restore default settings
            </Button>
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                {header}
            </Dialog.Header>
            <Dialog.Body icon={<WarningCircle />}>
                <Flex size={2}>
                    <Flex justifyContent="center">
                        <Typography id="dialog-confirm-description">{children || getMessage('compontents.confirmation.dialog.description')}</Typography>
                    </Flex>
                </Flex>
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Cancel>
                    <Button fullWidth variant="tertiary" onClick={onCancel} disabled={isActionAsync}>
                        {labelCancel || 'Cancel'}
                    </Button>
                </Dialog.Cancel>
                <Dialog.Action>
                    <Button fullWidth variant="danger-light" onClick={onConfirm} disabled={isActionAsync} startIcon={iconConfirm || <Check />}>
                        {labelConfirm || 'Confirm'}
                    </Button>
                </Dialog.Action>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
);

ConfirmationDialog.propTypes = {
    isVisible: PropTypes.bool,
    isActionAsync: PropTypes.bool,
    children: PropTypes.array.isRequired,
    header: PropTypes.string,
    labelCancel: PropTypes.string,
    labelConfirm: PropTypes.string,
    iconConfirm: PropTypes.object,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
