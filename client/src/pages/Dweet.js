import DisplayDweet from 'components/Dweet';
import { useParams } from 'react-router-dom';
import { Container } from 'shared/layout';

function DweetPage() {
  const { dweetId } = useParams();

  return (
    <Container>
      <div>
        <DisplayDweet dweetId={dweetId} />
      </div>
    </Container>
  );
}

export default DweetPage;
