import { gql } from "@apollo/client";

export const GET_BOARD = gql`
  query GetBoard($id: String!) {
    getBoard(id: $id) {
      id
      name
      createdAt
      updatedAt
      createdBy
      elements {
        id
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

export const ADD_BOARD_ACTION = gql`
  mutation AddBoardAction($boardId: String!, $action: String!) {
    addBoardAction(boardId: $boardId, action: $action) {
      id
      elements {
        id
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

export const UNDO_BOARD_ACTION = gql`
  mutation UndoBoardAction($boardId: String!) {
    undoBoardAction(boardId: $boardId) {
      id
      elements {
        id
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

export const REDO_BOARD_ACTION = gql`
  mutation RedoBoardAction($boardId: String!) {
    redoBoardAction(boardId: $boardId) {
      id
      elements {
        id
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

export const CURSOR_MOVEMENT = gql`
  subscription CursorMovement($boardId: String!) {
    cursorMovement(boardId: $boardId) {
      userId
      x
      y
      userName
    }
  }
`;

export const BOARD_UPDATES = gql`
  subscription BoardUpdates($boardId: String!) {
    boardUpdates(boardId: $boardId) {
      id
      elements {
        id
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`; 