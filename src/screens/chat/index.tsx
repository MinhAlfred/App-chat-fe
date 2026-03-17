import { Screen } from '../../navigation/routes';
import { useChatRoom } from './useChatRoom';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';

export default function Chat({ onNavigate }: { onNavigate: (s: Screen) => void }) {
    const {
        selectedRoom,
        filteredRooms,
        sortedMessages,
        searchKeyword,
        messageInput,
        isLoadingRooms,
        isLoadingMessages,
        isSending,
        errorMessage,
        myUserId,
        onlineUserIds,
        messageListRef,
        setSearchKeyword,
        setMessageInput,
        handleSelectRoom,
        handleSendMessage,
    } = useChatRoom();

    return (
        <div className="flex h-full w-full max-w-[1600px] mx-auto overflow-hidden bg-white shadow-2xl relative">
            <Sidebar
                filteredRooms={filteredRooms}
                selectedRoom={selectedRoom}
                isLoadingRooms={isLoadingRooms}
                searchKeyword={searchKeyword}
                onSearchChange={setSearchKeyword}
                onSelectRoom={(room) => void handleSelectRoom(room)}
                onNavigate={onNavigate}
            />
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <ChatHeader room={selectedRoom} />
                <MessageList
                    messages={sortedMessages}
                    isLoading={isLoadingMessages}
                    hasRoom={selectedRoom !== null}
                    myUserId={myUserId}
                    onlineUserIds={onlineUserIds}
                    listRef={messageListRef}
                />
                <MessageInput
                    value={messageInput}
                    onChange={setMessageInput}
                    onSubmit={handleSendMessage}
                    disabled={!selectedRoom}
                    isSending={isSending}
                    errorMessage={errorMessage}
                />
            </main>
        </div>
    );
}
