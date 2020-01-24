import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import { useWindowSize } from 'react-use';
import { useBeforeunload } from 'react-beforeunload';

import ReviewAndSave from '../ReviewAndSave';
import BasicInfos from './basicInfo';
import Location from './location';
import People from './people';
import Links from './links';
import FormButton from './formButton';
import styles from './styles';

import { api, setHeader } from '../../utils/axios';
import { SignupSchema } from './utils';
import { invitationStatus } from '../../utils/variables';
import { getFormStatus } from './formStatus';
import { cities } from './locationOptions';

const CommunityForm = ({
  service,
  initialValues,
  loading,
  credentials,
  type,
}) => {
  const pageTitles = {
    BasicInfos: 'Informações básicas',
    Location: 'Localização',
    People: 'Membros e Administradores',
    Links: 'Links',
    ReviewAndSave: 'Revisar e salvar',
  };
  const { width } = useWindowSize();
  const isMobile = width > 768 ? false : true;
  useBeforeunload(() => "You'll lose your data!");

  const formatAndSendForm = async (values) => {
    const { managers } = values;

    if (typeof values.logo === 'object') {
      const data = new FormData();
      data.append('file', values.logo);
      setHeader(credentials);
      const { data: response } = await api.post(`/logo/${values.slug}`, data);
      const { success, logo } = response;
      if (!success)
        toast.warn(
          'Não foi possível fazer upload do seu logo.\nTente novamente mais tarde'
        );
      values.logo = logo;
    }

    if (managers.length > 0) {
      for (const manager of managers) {
        const { status } = manager.invitation;
        if (status === invitationStatus.sending)
          manager.invitation.status = invitationStatus.sent;
      }
    }

    if (typeof values.members === 'string')
      values.members = parseInt(values.members.replace('.', ''));

    if (values.location.city) {
      const { location } = values;
      for (const city of cities) {
        if (location.state === city.state && location.city === city.value) {
          values.location.latitude = city.latitude;
          values.location.longitude = city.longitude;
          break;
        }
      }
    }

    service(values);
  };

  const [currentPage, setCurrentPage] = useState(Object.keys(pageTitles)[0]);

  const isDisabled = ({ page: button, currentStatus, currentPage }) => {
    const { stepsPercentage, totalPercentage } = currentStatus;
    const pages = Object.keys(pageTitles);

    if (button === currentPage) return false;
    if (button === 'ReviewAndSave') return totalPercentage < 100 ? true : false;

    const previousSteps = pages.slice(0, pages.indexOf(button));
    let previousCompleteness = 0;
    for (const step of previousSteps) {
      previousCompleteness += stepsPercentage[step];
    }

    previousCompleteness = previousCompleteness / previousSteps.length;
    const isDisabled = previousCompleteness < 100;

    return isDisabled;
  };

  const renderPages = (props) => {
    if (isMobile) {
      return (
        <>
          <BasicInfos {...props} />
          <Location {...props} />
          <People {...props} />
          <Links {...props} />
        </>
      );
    }

    return {
      BasicInfos: <BasicInfos {...props} />,
      Location: <Location {...props} />,
      People: <People {...props} pageType={type} />,
      Links: <Links {...props} />,
      ReviewAndSave: (
        <ReviewAndSave {...props} community={props.values} canModify={false} />
      ),
    }[props.currentPage];
  };

  const renderMenu = ({ currentStatus }) => {
    if (isMobile) return;

    let options = Object.keys(pageTitles);

    if (type === 'edit')
      options = options.filter((page) => page !== 'ReviewAndSave');

    return (
      <ul>
        {options.map((page) => (
          <li key={page}>
            <button
              disabled={isDisabled({
                page,
                currentPage,
                currentStatus,
              })}
              type="button"
              className={`page-title ${
                page === currentPage ? 'is-active' : ''
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {pageTitles[page]}
            </button>
          </li>
        ))}
        <style jsx>{styles}</style>
      </ul>
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SignupSchema}
      onSubmit={(values) => formatAndSendForm(values)}
    >
      {({
        values,
        setFieldValue,
        setFieldTouched,
        errors,
        touched,
        setErrors,
      }) => {
        const currentStatus = getFormStatus({ errors, values });
        return (
          <>
            <div className="columns is-centered">
              <div className="column has-text-centered">
                {type === 'create' && currentPage !== 'ReviewAndSave' && (
                  <>
                    <h1 className="title is-size-1-desktop is-size-2-tablet is-size-3-mobile">
                      Cadastre sua comunidade
                    </h1>
                    <h2 className="subtitle is-size-4-desktop">
                      Preencha o formulário e tenha sua comunidade publicada em
                      nosso diretório!
                    </h2>
                  </>
                )}
                {type === 'edit' && currentPage !== 'ReviewAndSave' && (
                  <h1 className="title is-size-1-desktop is-size-2-tablet is-size-3-mobile">
                    Edite sua comunidade
                  </h1>
                )}
              </div>
            </div>
            <Form>
              <div className="columns">
                {currentPage !== 'ReviewAndSave' && (
                  <div className="column is-6-tablet is-3-desktop is-offset-2-desktop menu-column">
                    {renderMenu({ currentStatus })}
                  </div>
                )}
                <div
                  className="column is-6-tablet is-5-desktop content-column"
                  style={
                    currentPage === 'ReviewAndSave' ? { width: '100%' } : {}
                  }
                >
                  {renderPages({
                    currentPage,
                    errors,
                    touched,
                    values,
                    initialValues,
                    credentials,
                    setFieldValue,
                    setFieldTouched,
                    setErrors,
                  })}
                  <FormButton
                    {...{
                      isMobile,
                      type,
                      pageTitles,
                      currentStatus,
                      currentPage,
                      setCurrentPage,
                      loading,
                    }}
                  />
                </div>
              </div>
            </Form>
            <style jsx>{styles}</style>
          </>
        );
      }}
    </Formik>
  );
};

CommunityForm.getInitialProps = async (ctx) => {
  const credentials = cookies(ctx).ctech_credentials || {};
  return { ...credentials };
};

export default CommunityForm;
