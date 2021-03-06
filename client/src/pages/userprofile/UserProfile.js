import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { setCurrentPage } from "../../redux/currentPage/currentPageActions";

import UserProfileUnfriendButton from "./userprofileunfriendbutton/UserProfileUnfriendButton";
import UserProfileStatusContainer from "./userprofilestatuses/UserProfileStatusContainer";

import FriendListItem from "./friendlistitem/FriendListItem";

import UserProfilePosts from "./UserProfilePosts";

import cloudloading from "../../imgs/cloudloading2.svg";

import "./UserProfile.scss";

const UserProfile = ({
  match,
  userId,
  token,
  isLoggedIn,
  friendList,
  setCurrentPage,
}) => {
  // 'userId' (current user) -different from- 'userid' (profile user)

  const { userid } = match.params;
  const profileUserId = userid;
  const [profileUser, setProfileUser] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [existingAdd, setExistingAdd] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [coverPhotoLoading, setCoverPhotoLoading] = useState(true);

  useEffect(() => {
    setCoverPhotoLoading(true);
    let isSubscribed = true;
    if (isSubscribed) {
      setCurrentPage("");
      const getProfileUser = async () => {
        const foundUser = await Axios.get(`/user/getuser/${profileUserId}`);
        setProfileUser(foundUser.data);
        if (foundUser.data._id === userId) {
          setCurrentPage("profile");
          setIsCurrentUser(true);
        } else if (foundUser.data.friendList.includes(userId)) {
          setIsFriend(true);
          setIsCurrentUser(false);
        } else {
          setIsCurrentUser(false);
        }
      };

      getProfileUser();

      const getExistingAdd = async () => {
        const existingFriendRequest = await Axios.get(
          `/user/getfriendrequest/`,
          {
            params: { userId, profileUserId },
            headers: { "x-auth-token": token },
          }
        );
        setExistingAdd(existingFriendRequest.data);
      };

      getExistingAdd();
    }
    return () => (isSubscribed = false);
  }, [userId, profileUserId, token, match, friendList, setCurrentPage]);

  const sendFriendRequest = () => {
    Axios.post(
      `/user/sendfriendrequest`,
      { recipientId: profileUserId },
      { headers: { "x-auth-token": token } }
    );
    setExistingAdd(true);
  };

  return (
    <>
      {profileUser && (
        <div className="profilepagecontainer">
          <div className="fixedcontainer">
            {coverPhotoLoading && (
              <img alt="loading" className="coverpicture" src={cloudloading} />
            )}

            <img
              src={
                profileUser.coverPicId
                  ? `/user/image/${profileUser.coverPicId}`
                  : ""
              }
              alt="profile cover"
              onLoad={() => setCoverPhotoLoading(false)}
              className={
                coverPhotoLoading ? "feedposthiddenimage" : "coverpicture"
              }
            />

            <div
              className="coverpicture"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.000)`,
              }}
            ></div>

            <h1 className="profilepagename">{profileUser.name}</h1>

            <img
              src={`/user/image/${profileUser.profilePicId}`}
              alt="profile"
              className="profilepicture"
            />
          </div>
          <>
            {isFriend && !isCurrentUser && (
              <UserProfileUnfriendButton
                page="UserProfile"
                token={token}
                friendId={profileUser._id}
                setIsFriend={setIsFriend}
                setExistingAdd={setExistingAdd}
              />
            )}
            <div className="profilepageaddoredit">
              {isCurrentUser ? (
                <Link className="linktoeditprofile" to="/edituser">
                  edit profile
                </Link>
              ) : !existingAdd && isLoggedIn && !isFriend ? (
                <div
                  className="userprofilefriendrequestbutton"
                  onClick={sendFriendRequest}
                >
                  add
                </div>
              ) : null}
            </div>
          </>
          <div className="profilegrid">
            <div className="profileinfobox">
              <div className="profilepageinfobox">
                <p className="profilepageemail">{profileUser.email}</p>
                <p className="profilepageage">
                  {profileUser.age && <>Age: {profileUser.age}</>}
                </p>
                <p className="profilepagecity">
                  {profileUser.city && <>Located in {profileUser.city} </>}
                </p>
                <p className="profilepagebio">
                  {profileUser.bio && <>{profileUser.bio}</>}
                </p>
              </div>
            </div>

            <div className="profilefriends">
              <h2 className="userprofilefriendlisttitle">friends</h2>
              <div className="profilepagefriendlist">
                {profileUser.friendList.length > 0 ? (
                  profileUser.friendList.map((friend) => (
                    <FriendListItem
                      friend={friend}
                      key={friend}
                      userId={userId}
                      token={token}
                      profileBelongsToCurrentUser={isCurrentUser}
                      isLoggedIn={isLoggedIn}
                    />
                  ))
                ) : (
                  <div className="nofriendsmessage">no friends yet!</div>
                )}
              </div>
            </div>

            <div className="profileposts">
              <h2 className="userprofilepostlisttitle">posts</h2>
              <UserProfilePosts userid={userid} />
            </div>

            <div className="profilestatusbox">
              <div className="profilestatusinnercontainer">
                <UserProfileStatusContainer
                  isCurrentUser={isCurrentUser}
                  token={token}
                  userid={userid}
                  profileUser={profileUser}
                  userId={userId}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  userId: state.auth.userId,
  token: state.auth.token,
  isLoggedIn: state.auth.isLoggedIn,
  friendList: state.currentUser.friendList,
});
const mapDispatchToProps = (dispatch) => ({
  setCurrentPage: (page) => dispatch(setCurrentPage(page)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
