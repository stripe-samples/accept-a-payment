import React from 'react';

const StatusMessages = ({messages}) => {
  if(messages.length) {
    return (
      <div id="messages" role="alert">
        {messages.map((m, i) => <div key={i}>{m}</div>)}
      </div>
    )
  }
  return '';
}

export default StatusMessages;
