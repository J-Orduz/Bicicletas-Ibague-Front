// styles
import './SubHeader.scss';

export const SubHeader = ({ pageTitle }) => {
  return (
    <section className="sub-header">
      <h1 className="page-title">{pageTitle}</h1>
    </section>
  );
};
