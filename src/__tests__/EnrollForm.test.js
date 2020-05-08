import React from 'react';
import TestRenderer from 'react-test-renderer';
import EnrollForm from '../components/EnrollForm';

beforeEach(() => {
  jest.resetModules();
  process.env = { 
    AIRTABLE_API_KEY: 'AIRTABLE_API_KEY',
    AIRTABLE_BASE: 'AIRTABLE_BASE',
    TRAIL_EVENT_ID: 'TRAIL_EVENT_ID',
  };
});

describe('EnrollForm', () => {

  it("renders the initial view", () => {
    const testRenderer = TestRenderer.create(
      <EnrollForm />,
    );
    let tree = testRenderer.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders name error when everything is empty", () => {
    const testRenderer = TestRenderer.create(
      <EnrollForm />,
    );

    const testInstance = testRenderer.root;
    const btn = testInstance.findByProps({
      type: 'submit',
    });

    const eventMock = { preventDefault: jest.fn() };
    btn.props.onClick(eventMock);

    const tree = testRenderer.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders error when email is not valid, but name is valid", () => {
    const testRenderer = TestRenderer.create(
      <EnrollForm />,
    );

    const testInstance = testRenderer.root;
    const btn = testInstance.findByProps({
      type: 'submit',
    });
    const nameInput = testInstance.findByProps({
      name: 'name',
    });
    const emailInput = testInstance.findByProps({
      name: 'email',
    });
    const wechatInput = testInstance.findByProps({
      name: 'wechat',
    });

    nameInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'Name', name: 'name' }
    });
    emailInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'wrongemail', name: 'email' }
    });
    wechatInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'correctwechat', name: 'wechat' }
    });

    const eventMock = { preventDefault: jest.fn() };
    btn.props.onClick(eventMock);

    const tree = testRenderer.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders error when wechat is not valid, but name and email are valid", () => {
    const testRenderer = TestRenderer.create(
      <EnrollForm />,
    );

    const testInstance = testRenderer.root;
    const btn = testInstance.findByProps({
      type: 'submit',
    });
    const nameInput = testInstance.findByProps({
      name: 'name',
    });
    const emailInput = testInstance.findByProps({
      name: 'email',
    });
    const wechatInput = testInstance.findByProps({
      name: 'wechat',
    });

    nameInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'Name', name: 'name' }
    });
    emailInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'valid@email.com', name: 'email' }
    });
    wechatInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: '!@#$', name: 'wechat' }
    });

    const eventMock = { preventDefault: jest.fn() };
    btn.props.onClick(eventMock);

    const tree = testRenderer.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it.skip("renders notification after submit successfully, with submit button disappeared",  done => {

    const spy = jest.spyOn(EnrollForm, 'handleSubmit').mockImplementation(async (event) => {
      console.log('in spy');
    });

    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    EnrollForm.prototype.handleSubmit = handleSubmit;

    const testRenderer = TestRenderer.create(
      <EnrollForm />,
    );

    const testInstance = testRenderer.root;
    const btn = testInstance.findByProps({
      type: 'submit',
    });
    const nameInput = testInstance.findByProps({
      name: 'name',
    });
    const emailInput = testInstance.findByProps({
      name: 'email',
    });
    const wechatInput = testInstance.findByProps({
      name: 'wechat',
    });

    nameInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'Name', name: 'name' }
    });
    emailInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'valid@email.com', name: 'email' }
    });
    wechatInput.props.onChange({
      preventDefault: jest.fn(),
      target: { value: 'goodwechathandle', name: 'wechat' }
    });

    const eventMock = { preventDefault: jest.fn() };
    btn.props.onClick(eventMock);
    
    setTimeout(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      const tree = testRenderer.toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });

  });
});
