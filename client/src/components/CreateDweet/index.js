import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { DialogOverlay } from '@reach/dialog';
import '@reach/dialog/styles.css';
import {
  Header,
  Title,
  CloseButton,
  Content,
  Form,
  Textarea,
  Button,
  StyledDialogContent,
} from './style';
import TextareaGroup from 'components/TextareaGroup';
import { useCreateDweet } from 'utils/dweets';
import { IoMdClose } from 'react-icons/io';

export function CreateDweetModal() {
  const history = useHistory();

  const close = (e) => {
    if (e) e.stopPropagation();
    history.goBack();
  };

  return (
    <DialogOverlay onDismiss={close}>
      <StyledDialogContent aria-label="Compose new dweet">
        <Header>
          <Title>Compose new Dweet</Title>
          <CloseButton onClick={close}>
            <IoMdClose />
          </CloseButton>
        </Header>
        <Content>
          <CreateDweetForm onCreate={close} />
        </Content>
      </StyledDialogContent>
    </DialogOverlay>
  );
}

function CreateDweetForm({ onCreate }) {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState({});
  const createDweetMutation = useCreateDweet();

  function handleChange(e) {
    setText(e.target.value);
  }

  function validateDweet(dweet) {
    if (dweet.text.length < 1 || dweet.text.length > 280) {
      setErrors({
        message: 'Dweet text length must be between 1 and 280 characters',
      });
      return false;
    }
    return true;
  }

  function addDweet(e) {
    e && e.preventDefault();

    const dweet = { text };

    if (validateDweet(dweet)) {
      createDweetMutation.mutate(dweet, {
        onSuccess: () => {
          if (onCreate) onCreate();
        },
        onError: (err) => {
          setErrors(
            err.response?.data || { message: 'An error has occurred!' }
          );
        },
      });
    }
  }

  function handleEnterPress(e) {
    e.preventDefault();
    if (e.keyCode === 13 && e.shiftKey === false) {
      addDweet();
    }
  }

  return (
    <Form onSubmit={addDweet}>
      <TextareaGroup
        textarea={Textarea}
        text={text}
        handleChange={handleChange}
        handleEnterPress={handleEnterPress}
        placeholder="What's happening?"
        error={Object.keys(errors).length > 0}
        errorMsg={errors.message || ''}
      />
      <Button
        primary
        type="submit"
        disabled={
          text.length < 1 || text.length > 280 || createDweetMutation.isLoading
        }
      >
        {createDweetMutation.isLoading ? 'Loading...' : 'Dweet'}
      </Button>
    </Form>
  );
}

CreateDweetForm.propTypes = {
  onCreate: PropTypes.func,
};

export default CreateDweetForm;
