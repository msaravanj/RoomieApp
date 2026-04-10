package com.myrestapp.roomie.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"housing", "lifestyleProfile"})
@EqualsAndHashCode(exclude = {"housing", "lifestyleProfile"})
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private int id;

    @Column(name="name")
    private String name;

    @Column(name="last_name")
    private String lastName;

    @Column(name="gender")
    private String gender;

    @Column(name="yob")
    private int yob;

    @Column(name="city")
    private String city;

    @Column(name="description", length = 2000)
    private String description;

    @Column(name="profile_picture_url")
    private String profilePictureUrl;

    @Column(name="email", unique = true)
    private String email;

    @Column(name="password")
    private String password;

    @Column(name="role")
    private String role;

    @Column(name="has_accomodation")
    private boolean hasAccomodation;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "lifestyle_profile_id")
    private LifestyleProfile lifestyleProfile;

    @OneToOne(mappedBy = "user",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @JsonIgnore
    private Housing housing;



    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.getRole() == null ? List.of() :
                List.of(new SimpleGrantedAuthority(this.getRole()));
    }



}
