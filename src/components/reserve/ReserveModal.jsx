import React, { useContext, useState } from "react";
import "./reserve.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import useFetch from "./../../hooks/useFetch";
import { SearchContext } from "./../../context/SearchContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReserveModal({ setOpenModal, hotelId }) {
  const navigate = useNavigate();
  const [selectedRooms, setSelectedRooms] = useState([]);

  const { data, loading, error } = useFetch(`room/${hotelId}`);

  const { dates } = useContext(SearchContext);
  console.log("dates");
  console.log(dates);

  // Get All Dates in the Calendar for Booking
  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const date = new Date(start.getTime());

    let list = [];
    while (date <= end) {
      list.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }
    return list;
  };

  const allDates = getDatesInRange(dates[0].startDate, dates[0].endDate);

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      allDates.includes(new Date(date).getTime())
    );
    return !isFound;
  };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value; // room _id
    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );
  };

  console.log("selectedRooms");
  console.log(selectedRooms);

  const handleClick = async () => {
    try {
      await Promise.all(
        selectedRooms.map((roomNumberId) => {
          console.log(roomNumberId);
          const res = axios.put(`/rooms/availability/${roomNumberId}`, {
            dates: allDates,
          });
          return res.data;
        })
      );
      setOpenModal(false);
      navigate("/");
    } catch (err) {}
  };

  return (
    <div className="reserve">
      <div className="rContainer">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose"
          onClick={() => setOpenModal(false)}
        />
        <span>Select your rooms: </span>
        {data &&
          data.map((item) => {
            return (
              <div className="rItem">
                <div className="rItemInfo">
                  <div className="rTitle">{item.title}</div>
                  <div className="rDesc">{item.desc}</div>
                  <div className="rMax">
                    Max people: <b>{item.maxPeople}</b>
                  </div>
                  <div className="rPrice">{item.price}</div>
                </div>

                <div className="rSelectRooms">
                  {/* {JSON.stringify(item)} */}
                  {item.roomNumbers.map((roomNumber) => (
                    <div className="room">
                      <label>{roomNumber.number}</label>
                      <input
                        type="checkbox"
                        value={roomNumber._id}
                        onChange={handleSelect}
                        disabled={!isAvailable(roomNumber)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        <button onClick={handleClick} className="rButton">
          Reserve Now!
        </button>
      </div>
    </div>
  );
}

export default ReserveModal;
