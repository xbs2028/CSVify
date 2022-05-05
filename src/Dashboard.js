import { useFetch } from './useFetch';
import React, { useState, useEffect } from 'react';
import paginated_fetch from './fetch';
import { useCallback } from 'react';

function downloadCSV(csv, fileName) {
  var a = document.createElement('a');
  var file = new Blob([csv], { type: 'text/csv' });
  a.href = URL.createObjectURL(file);
  a.download = fileName + ".csv";
  a.click();
}

const Playlists = ({ url, offset, limit, headers, searchVal }) => {
  const { loading, products } = useFetch(url, headers);
  const [playlists, setPlaylists] = useState([]);

  const fetchAllPlaylists = useCallback(async () => {
    await paginated_fetch(url, offset, headers, products.total).then(
      (products) => {
        let fetchedData = [];
        for (let chunk of products) {
          chunk.items.map((item) => {
            return fetchedData.push({
              name: item.name,
              href: item.tracks.href,
              total: item.tracks.total,
            });
          });
        }

        setPlaylists(fetchedData);
        //return fetchedData;
      }
    );
  }, [products, headers, offset, url]);

  useEffect(() => {
    if (loading === true && products !== null) {
      fetchAllPlaylists();
    }
  }, [loading, products, playlists, fetchAllPlaylists]);

  return (
    <>
      {loading
        ? 'Loading...'
        : playlists.map((item) => {
          let name = item.name.toString()
          if (name.toLowerCase().includes(searchVal.toLowerCase()))
          {
            return (
              <Tracks
                url={item.href}
                offset={offset}
                limit={limit}
                headers={headers}
                name={item.name}
                total={item.total}
              ></Tracks>
            );
          }
        })}
    </>
  );
};

const Tracks = ({ url, offset, limit, headers, name, total, searchVal }) => {
  const { loading, products } = useFetch(url, headers);

  const download = async () => {
    if (name === null) {
      name = 'Liked Songs';
    }

    await paginated_fetch(url, offset, headers, total)
      .then((products) => {
        let fetchedData = [];
        for (let chunk of products) {
          chunk.items.map((item) => {
            console.log(item);
            let fetchedArtists = "";
            let artistFollowers = "";
            item.track.artists.map((item) => {
              fetchedArtists += item.name + ", ";
              artistFollowers += item.followers + ", ";
            });

            fetchedArtists = fetchedArtists.substring(0, fetchedArtists.length-2);
            artistFollowers = artistFollowers.substring(0, artistFollowers.length-2);
            // let artistString = fetchedArtists.toLocaleString.replace(/,/g, ', ').trim().toString()

            return fetchedData.push([
              item.track.external_ids.isrc.replaceAll(",", ";"),
              item.track.external_urls.spotify.replaceAll(",", ";"),
              item.track.name.replaceAll(",", ";"),
              fetchedArtists.replaceAll(",", ";"),

              // artistFollowers.replaceAll(",", ";"),


              item.track.album.name.replaceAll(",", ";"),
              // label
              // item.track.album.label,
              // item.track.album.label.replaceAll(",", ";"),
              // //release date
              item.track.album.release_date.replaceAll(",", ";"),
              // //release type
              item.track.album.type.replaceAll(",", ";"),
            ]);
          });
        }
        return fetchedData;
      })
      .then((fetchedData) => {

        const rows = [ [],
        ];
        // let csvContent = "Song Name, Album, Artist(s)";

        for (var i = 0; i < fetchedData.length; i++) {
          rows.push([fetchedData[i]]);
        }

        let csvContent = "ISRC, Link, Track Name, Artist Name(s), Album Name, Release Date, Release Type";
        for (var j = 0; j<rows.length; j++) {
          // const row = rowArray.join(",");
          // var i = 0;
          csvContent += `${rows[j]}\r\n`;
          // i += 1;
        }

        downloadCSV(csvContent, name);
      });
  };

  return (
    <>
      <h2>
        {loading ? (
          'Loading...'
        ) : (
          <article>
            <h2>{name || 'Liked Songs'}</h2>
            <h4>{(total || products.total) + ' tracks found'}</h4>
            <button className="button" type="button" onClick={download}>
              Download
            </button>
          </article>
        )}
      </h2>
    </>
  );
};

const Dashboard = ({ code }) => {
  const [search, setSearch] = useState("");
  const authBearer = `Bearer ${code}`;

  const offset = 0;
  const limit = 50;
  //const maxSongs = 10000;

  const urlPlaylists = 'https://api.spotify.com/v1/me/playlists';
  const urlTracks = 'https://api.spotify.com/v1/me/tracks';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: authBearer,
  };

  // if (search === "") {
  return (
    <>
      <input type="text"
      placeholder="Search by keyword"
      onChange={(e) => {
      setSearch(e.target.value);
      }}></input>

      {/* <Tracks
        url={urlTracks}
        offset={offset}
        limit={limit}
        headers={headers}
        name={null}
        total={null}
        searchVal={search}
      ></Tracks> */}

      <Playlists
        url={urlPlaylists}
        offset={offset}
        limit={limit}
        headers={headers}
        searchVal={search}
      ></Playlists>
      <article>
        <h3>
          You might want to signout of{' '}
          <a href="https://www.spotify.com">Spotify</a> after you finish your
          downloads. <br />
          The access token for this application automatically expires after a
          short duration
        </h3>
      </article>
    </>
  );
  // }
  // else {
  //   return (
  //     <>
  //       <input type="text"
  //       placeholder="Search by keyword"
  //       onChange={(e) => {
  //       setSearch(e.target.value);
  //       }}></input>

  //       <Playlists
  //         url={urlPlaylists}
  //         offset={offset}
  //         limit={limit}
  //         headers={headers}
  //         searchVal={search}
  //       ></Playlists>

  //     </>
      
  //   );
  // }
};

export default Dashboard;
