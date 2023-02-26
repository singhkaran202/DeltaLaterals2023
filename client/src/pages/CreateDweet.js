import CreateDweetForm from 'components/CreateDweet';
import 'styled-components/macro';
import { useHistory } from 'react-router';
import { Container } from 'shared/layout';

function CreateDweetPage() {
  const history = useHistory();

  return (
    <Container>
      <div
        css={`
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
        `}
      >
        <CreateDweetForm onCreate={() => history.push('/')} />
      </div>
    </Container>
  );
}

export default CreateDweetPage;
