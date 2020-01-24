import React, { useEffect } from 'react';

import slug from 'slug';
import Select from 'react-select';
import { Field, ErrorMessage } from 'formik';
import makeAnimated from 'react-select/animated';

import CustomLogo from './customLogo';
import { api, setHeader } from '../../utils/axios';
import { reactSelectStyle } from './reactSelectStyle';
import styles from './styles';
import {
  CATEGORIES,
  TAGS,
  TYPES,
  GLOBAL_PROGRAM,
  errorMessages,
} from './utils';

export default function BasicInfos({
  credentials,
  errors,
  touched,
  values,
  initialValues,
  setFieldValue,
  setFieldTouched,
}) {
  const { nameAlreadyExists, slugAlreadyExists } = errorMessages;

  const animatedComponents = makeAnimated();

  useEffect(() => {
    setFieldValue('slug', slug(values.name, { lower: true }));
  }, [values.name]);

  const checkSlug = async (slug) => {
    const toShort = slug.length < 4;
    const notChanged = slug === initialValues.slug;
    if (!slug || toShort || notChanged) return;
    setHeader(credentials);
    const { data } = await api.get(`/community/checkSlug/${slug}`);
    return data ? slugAlreadyExists : null;
  };

  const checkName = async (name) => {
    const toShort = name.length < 4;
    const notChanged = name === initialValues.name;
    if (!name || toShort || notChanged) return;
    setHeader(credentials);
    const { data } = await api.get(`/community/checkName/${name}`);

    return data ? nameAlreadyExists : null;
  };

  const handleChange = (selectedOption) => {
    const selected = selectedOption && selectedOption.map(({ value }) => value);
    setFieldValue('tags', selected);
  };
  const handleStringChange = (selectedOption, data) => {
    setFieldValue(data || data.value, selectedOption.value);
  };
  return (
    <>
      <label>
        Nome da comunidade *
        <div className="input-wrapper">
          <i className="fas fa-users fa-fw"></i>
          <Field
            name="name"
            validate={checkName}
            onBlur={() => setFieldTouched('name', true)}
            className="input is-medium"
            placeholder="Digite o nome da sua comunidade"
          />
        </div>
        {errors.name === nameAlreadyExists && !touched.name && (
          <div className="form-error">{errors.name}</div>
        )}
        <ErrorMessage name="name">
          {(msg) => <div className="form-error">{msg}</div>}
        </ErrorMessage>
      </label>
      <label>
        Url da comunidade *
        <div className="input-wrapper">
          <i className="fas fa-users fa-fw"></i>
          <Field
            name="slug"
            value={`comunidades.tech/c/${values.slug}`}
            validate={checkSlug}
            className="input is-medium"
            disabled
          />
        </div>
        {errors.slug === slugAlreadyExists && (
          <div className="form-error">{errors.slug}</div>
        )}
      </label>
      <label>
        Tipo *
        <Select
          name="type"
          icon="\f075"
          defaultValue={TYPES.filter((type) => type.value === values.type)}
          closeMenuOnSelect={true}
          components={animatedComponents}
          placeholder="Clique para selecionar"
          options={TYPES}
          onBlur={() => setFieldTouched('type', true)}
          onChange={(selectedOption, data) =>
            handleStringChange(selectedOption, data.name)
          }
          styles={reactSelectStyle}
        />
        <ErrorMessage name="type">
          {(msg) => <div className="form-error">{msg}</div>}
        </ErrorMessage>
      </label>
      <label>
        Categoria *
        <Select
          name="category"
          icon="\f03a"
          defaultValue={CATEGORIES.filter(
            (category) => category.value === values.category
          )}
          closeMenuOnSelect={true}
          components={animatedComponents}
          placeholder="Clique para selecionar"
          options={CATEGORIES}
          onBlur={() => setFieldTouched('category', true)}
          onChange={(selectedOption, data) =>
            handleStringChange(selectedOption, data.name, setFieldValue)
          }
          styles={reactSelectStyle}
        />
        <ErrorMessage name="category">
          {(msg) => <div className="form-error">{msg}</div>}
        </ErrorMessage>
      </label>
      <label>
        Tags *
        <Select
          name="tags"
          icon="\f02b"
          defaultValue={
            values.tags &&
            TAGS.filter((type) => values.tags.includes(type.value))
          }
          closeMenuOnSelect={false}
          components={animatedComponents}
          placeholder="Clique para selecionar"
          isMulti
          options={TAGS}
          onBlur={() => setFieldTouched('tags', true)}
          onChange={handleChange}
          styles={reactSelectStyle}
        />
        <ErrorMessage name="tags">
          {(msg) => <div className="form-error">{msg}</div>}
        </ErrorMessage>
      </label>
      <fieldset>
        <legend>Pertence a algum programa global?</legend>
        <div className="radio-group">
          {GLOBAL_PROGRAM.map((item) => (
            <div className="radio-item" key={item.label}>
              <input
                type="radio"
                name="globalProgram.isParticipant"
                value={item.value}
                checked={item.value === values.globalProgram.isParticipant}
                id={item.value.toString()}
                onChange={() =>
                  setFieldValue('globalProgram.isParticipant', item.value)
                }
              />
              <label htmlFor={item.value.toString()} className="radio-label">
                {item.label}
              </label>
            </div>
          ))}
        </div>
        <ErrorMessage name="globalProgram.isParticipant">
          {(msg) => <div className="form-error">{msg}</div>}
        </ErrorMessage>
      </fieldset>
      {values.globalProgram.isParticipant && (
        <label>
          Qual? *
          <div className="input-wrapper">
            <i className="fas fa-users fa-fw"></i>
            <Field
              name="globalProgram.name"
              defaultValue={values.globalProgram.name}
              className="input"
              placeholder="Digite o nome do programa"
            />
          </div>
          <ErrorMessage name="globalProgram.name">
            {(msg) => <div className="form-error">{msg}</div>}
          </ErrorMessage>
        </label>
      )}
      <label>Logo da comunidade *</label>
      <div className="input-wrapper">
        <CustomLogo
          name="logo"
          {...{
            setFieldValue,
            currentLogo: initialValues.logo,
          }}
        />
      </div>
      <label>
        Descrição *
        <div className="input-wrapper">
          <Field
            name="description"
            component="textarea"
            className="textarea"
            rows="4"
            placeholder="Escreva um pouco sobre a comunidade"
          />
        </div>
        <ErrorMessage name="description">
          {(msg) => <div className="form-error">{msg}</div>}
        </ErrorMessage>
      </label>
      <p className="required-form">* Itens obrigatórios</p>
      <style jsx>{styles}</style>
    </>
  );
}
